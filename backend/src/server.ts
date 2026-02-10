/**
 * Bazar Buy Backend Server
 * Node.js + Express + TypeScript
 * API Version: /api/v1 (Decision D-006)
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// ============= MIDDLEWARE =============
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============= HEALTH CHECK =============
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============= API V1 ROUTES =============
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const catalogRoutes = require('./routes/catalog');
const clientsRoutes = require('./routes/clients');
const adminRoutes = require('./routes/admin');

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/orders`, ordersRoutes);
app.use(`${API_PREFIX}/catalog`, catalogRoutes);
app.use(`${API_PREFIX}/clients`, clientsRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ============= 404 HANDLER =============
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// ============= ERROR HANDLER =============
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

// ============= START SERVER =============
app.listen(PORT, () => {
  console.log(`🚀 Bazar Buy Backend running on port ${PORT}`);
  console.log(`📍 API: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

export default app;
