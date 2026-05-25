import { Router, Request, Response } from 'express';
import { getDb } from '../services/database';
import { getAllSheetData } from '../services/excel';

const router = Router();

function detectTrend(values: number[]): string {
  if (values.length < 3) return 'insufficient data';
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((acc, v, i) => acc + i * v, 0);
  const sumX2 = values.reduce((acc, _, i) => acc + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const pctChange = Math.abs(slope / (sumY / n)) * 100;
  if (pctChange < 2) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}

function findOutliers(values: number[]): number[] {
  if (values.length < 4) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return values.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
}

router.get('/:id/:sheet', (req: Request, res: Response) => {
  const db = getDb();
  const source = db.prepare('SELECT * FROM datasources WHERE id = ?').get(req.params.id) as any;
  if (!source) { res.status(404).json({ error: 'Not found' }); return; }

  try {
    const rows = getAllSheetData(source.filepath, decodeURIComponent(req.params.sheet));
    if (rows.length === 0) { res.json({ insights: [] }); return; }

    const columns = Object.keys(rows[0]);
    const insights: string[] = [];

    insights.push(`Dataset contains **${rows.length.toLocaleString()} rows** and **${columns.length} columns**.`);

    const nullCounts: Record<string, number> = {};
    for (const col of columns) {
      nullCounts[col] = rows.filter((r) => r[col] == null || r[col] === '').length;
    }
    const highNullCols = Object.entries(nullCounts).filter(([, n]) => n / rows.length > 0.2);
    if (highNullCols.length > 0) {
      insights.push(`**Data quality alert:** ${highNullCols.map(([c, n]) => `"${c}" (${Math.round(n / rows.length * 100)}% missing)`).join(', ')} have significant missing values.`);
    }

    for (const col of columns) {
      const vals = rows.map((r) => parseFloat(String(r[col]))).filter((n) => !isNaN(n));
      if (vals.length < rows.length * 0.5) continue;
      const trend = detectTrend(vals);
      if (trend !== 'stable' && trend !== 'insufficient data') {
        insights.push(`**"${col}"** shows a ${trend} trend across the dataset.`);
      }
      const outliers = findOutliers(vals);
      if (outliers.length > 0 && outliers.length <= 10) {
        insights.push(`**"${col}"** has ${outliers.length} potential outlier${outliers.length > 1 ? 's' : ''} detected (IQR method).`);
      }
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / vals.length;
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / vals.length;
      const cv = Math.sqrt(variance) / Math.abs(mean);
      if (cv > 1) {
        insights.push(`**"${col}"** shows high variability (CV: ${Math.round(cv * 100)}%), suggesting diverse values.`);
      }
    }

    for (const col of columns) {
      const vals = rows.map((r) => r[col]).filter((v) => v != null);
      const numericVals = vals.map((v) => parseFloat(String(v))).filter((n) => !isNaN(n));
      if (numericVals.length > vals.length * 0.5) continue;
      const unique = new Set(vals.map(String));
      if (unique.size === 1) {
        insights.push(`Column **"${col}"** has only one unique value — consider whether it adds analytical value.`);
      } else if (unique.size <= 5) {
        insights.push(`Column **"${col}"** has ${unique.size} unique categories: ${[...unique].join(', ')}.`);
      } else if (unique.size === rows.length) {
        insights.push(`Column **"${col}"** appears to be a unique identifier (all values distinct).`);
      }
    }

    if (insights.length < 3) {
      insights.push(`All ${columns.length} columns contain data. Consider exploring correlations between numeric columns for deeper insights.`);
    }

    res.json({ insights, rowCount: rows.length, columnCount: columns.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
