import { Router, Request, Response } from 'express';
import { getDb } from '../services/database';
import { getSheetData, getAllSheetData } from '../services/excel';
import * as XLSX from 'xlsx';

const router = Router();

router.get('/:id/:sheet', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  const { page, pageSize, sort, dir, ...filters } = req.query as Record<string, string>;

  try {
    const result = getSheetData(source.filepath, decodeURIComponent(req.params.sheet), {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 100,
      sortColumn: sort,
      sortDirection: dir as 'asc' | 'desc',
      filters: Object.keys(filters).length ? filters : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/:sheet/all', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const rows = getAllSheetData(source.filepath, decodeURIComponent(req.params.sheet));
    res.json({ rows, total: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/:sheet/export', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const rows = getAllSheetData(source.filepath, decodeURIComponent(req.params.sheet));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${source.name}-${req.params.sheet}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/:sheet/stats', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const rows = getAllSheetData(source.filepath, decodeURIComponent(req.params.sheet));
    if (rows.length === 0) { res.json({ columns: [], stats: {} }); return; }

    const columns = Object.keys(rows[0]);
    const stats: Record<string, any> = {};

    for (const col of columns) {
      const values = rows.map((r) => r[col]).filter((v) => v != null);
      const numeric = values.map((v) => parseFloat(String(v))).filter((n) => !isNaN(n));

      if (numeric.length > 0) {
        numeric.sort((a, b) => a - b);
        const sum = numeric.reduce((a, b) => a + b, 0);
        const mean = sum / numeric.length;
        const mid = Math.floor(numeric.length / 2);
        const median = numeric.length % 2 !== 0 ? numeric[mid] : (numeric[mid - 1] + numeric[mid]) / 2;
        const variance = numeric.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numeric.length;
        stats[col] = {
          type: 'numeric',
          count: numeric.length,
          nullCount: rows.length - values.length,
          min: numeric[0],
          max: numeric[numeric.length - 1],
          mean: Math.round(mean * 100) / 100,
          median: Math.round(median * 100) / 100,
          stdDev: Math.round(Math.sqrt(variance) * 100) / 100,
          sum: Math.round(sum * 100) / 100,
        };
      } else {
        const unique = new Set(values.map(String));
        const freq: Record<string, number> = {};
        for (const v of values) { const k = String(v); freq[k] = (freq[k] || 0) + 1; }
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
        stats[col] = {
          type: 'categorical',
          count: values.length,
          nullCount: rows.length - values.length,
          uniqueCount: unique.size,
          topValues: top.map(([value, count]) => ({ value, count })),
        };
      }
    }

    res.json({ columns, stats, rowCount: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
