import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../services/database';

const router = Router();

router.get('/:datasourceId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM chart_configs WHERE datasource_id = ? ORDER BY updated_at DESC').all(req.params.datasourceId) as any[];
  res.json(rows.map((r) => ({ ...r, config: JSON.parse(r.config) })));
});

router.post('/', (req: Request, res: Response) => {
  const { datasource_id, name, config } = req.body;
  if (!datasource_id || !name || !config) {
    res.status(400).json({ error: 'datasource_id, name, config required' });
    return;
  }
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO chart_configs (id, datasource_id, name, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, datasource_id, name, JSON.stringify(config), now, now
  );
  res.json({ id, datasource_id, name, config, created_at: now, updated_at: now });
});

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const chart = db.prepare('SELECT * FROM chart_configs WHERE id = ?').get(req.params.id) as any;
  if (!chart) { res.status(404).json({ error: 'Not found' }); return; }
  const { name, config } = req.body;
  const now = new Date().toISOString();
  db.prepare('UPDATE chart_configs SET name = ?, config = ?, updated_at = ? WHERE id = ?').run(
    name ?? chart.name, config ? JSON.stringify(config) : chart.config, now, req.params.id
  );
  res.json({ ...chart, name: name ?? chart.name, config: config ?? JSON.parse(chart.config), updated_at: now });
});

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM chart_configs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
