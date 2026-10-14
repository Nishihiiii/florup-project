import express from 'express';
import cors from 'cors';
import plantsRoutes from './routes/plants.routes.js';
import problemsRoutes from './routes/problems.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'florup-api', timestamp: new Date().toISOString() });
});
app.use('/api/plants', plantsRoutes);
app.use('/api/problems', problemsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Маршрут не найден' }));
app.use((err, _req, res, _next) => {
  console.error('[API error]', err);
  res.status(500).json({ error: 'Не удалось выполнить запрос к базе данных', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

export default app;
