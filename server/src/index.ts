import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './services/database';
import datasourcesRouter from './routes/datasources';
import dataRouter from './routes/data';
import chartsRouter from './routes/charts';
import insightsRouter from './routes/insights';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

initDb();

app.use('/api/datasources', datasourcesRouter);
app.use('/api/data', dataRouter);
app.use('/api/charts', chartsRouter);
app.use('/api/insights', insightsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`ReportyCharty server running on http://localhost:${PORT}`);
});
