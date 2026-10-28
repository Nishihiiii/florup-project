import express from 'express';
import cors from 'cors';
import plantsRoutes from './routes/plants.routes.js';
import problemsRoutes from './routes/problems.routes.js';

const app = express();

app.use('/api', (_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'florup-api', timestamp: new Date().toISOString() });
});
app.use('/api/plants', plantsRoutes);
app.use('/api/problems', problemsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
app.use((err, _req, res, _next) => {
  console.error('[API error]', err);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ error: status === 500 ? 'Не удалось выполнить запрос к базе данных' : err.message, detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

export default app;
