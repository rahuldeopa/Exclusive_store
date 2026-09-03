import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import { validate } from './middleware/validate.middleware';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import contentRoutes from './routes/content.routes';
import uploadRoutes from './routes/upload.routes';
dotenv.config();

import { env } from './config/env';

const app = express();

app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

import bookRoutes from './routes/book.routes';
import downloadRoutes from './routes/download.routes';

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/download', downloadRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
