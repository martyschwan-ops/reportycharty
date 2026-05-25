import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { getDb } from '../services/database';
import { upload } from '../middleware/upload';
import { parseExcelFile } from '../services/excel';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM datasources ORDER BY updated_at DESC').all() as any[];
  const sources = rows.map((r) => ({ ...r, sheets: JSON.parse(r.sheets) }));
  res.json(sources);
});

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  try {
    const { sheets } = parseExcelFile(req.file.path);
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    const name = req.body.name || path.parse(req.file.originalname).name;

    db.prepare(`
      INSERT INTO datasources (id, name, filename, filepath, size, uploaded_at, updated_at, sheets)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, req.file.originalname, req.file.path, req.file.size, now, now, JSON.stringify(sheets));

    db.prepare(`
      INSERT OR REPLACE INTO recent_views (id, datasource_id, viewed_at)
      VALUES (?, ?, ?)
    `).run(uuidv4(), id, now);

    res.json({ id, name, filename: req.file.originalname, size: req.file.size, sheets, uploaded_at: now, updated_at: now });
  } catch (err: any) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'name is required' }); return; }

  const now = new Date().toISOString();
  db.prepare('UPDATE datasources SET name = ?, updated_at = ? WHERE id = ?').run(name, now, req.params.id);
  res.json({ ...source, name, sheets: JSON.parse(source.sheets), updated_at: now });
});

router.post('/:id/refresh', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) {
    fs.unlinkSync(req.file.path);
    res.status(404).json({ error: 'Not found' });
    return;
  }
  try {
    const { sheets } = parseExcelFile(req.file.path);
    if (fs.existsSync(source.filepath)) fs.unlinkSync(source.filepath);
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE datasources SET filename = ?, filepath = ?, size = ?, updated_at = ?, sheets = ?
      WHERE id = ?
    `).run(req.file.originalname, req.file.path, req.file.size, now, JSON.stringify(sheets), req.params.id);
    const updated = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
    res.json({ ...updated, sheets });
  } catch (err: any) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }
  if (fs.existsSync(source.filepath)) fs.unlinkSync(source.filepath);
  db.prepare('DELETE FROM datasources WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/recent', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT d.*, rv.viewed_at FROM datasources d
    JOIN recent_views rv ON d.id = rv.datasource_id
    ORDER BY rv.viewed_at DESC LIMIT 10
  `).all() as any[];
  res.json(rows.map((r) => ({ ...r, sheets: JSON.parse(r.sheets) })));
});

router.post('/:id/view', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT OR REPLACE INTO recent_views (id, datasource_id, viewed_at)
    VALUES ((SELECT id FROM recent_views WHERE datasource_id = ? LIMIT 1), ?, ?)
  `).run(req.params.id, req.params.id, now);
  const existing = db.prepare('SELECT id FROM recent_views WHERE datasource_id = ?').get(req.params.id) as any;
  if (!existing) {
    const { v4: uuidv4 } = require('uuid');
    db.prepare('INSERT INTO recent_views (id, datasource_id, viewed_at) VALUES (?, ?, ?)').run(uuidv4(), req.params.id, now);
  }
  res.json({ success: true });
});

export default router;
