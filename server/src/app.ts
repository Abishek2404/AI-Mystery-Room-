
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { config } from './config/index.js';
import { sessionMiddleware } from './middleware/session.js';
import { errorHandler } from './middleware/errorHandler.js';
import caseRoutes from './routes/case.routes.js';

const app = express();

// Render port configuration
const PORT = Number(process.env.PORT) || config.port;

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Session
app.use(sessionMiddleware);

// Rate limiting
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait before trying again.',
    },
  },
});

app.use('/api/cases', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return generateLimiter(req, res, next);
  }
  next();
});

// Health check
app.get('/health', (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api/cases', caseRoutes);

// Error handler
app.use(errorHandler);

// Start HTTP server first
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Connect MongoDB independently
async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    console.error('Check MongoDB Atlas Network Access and MONGODB_URI.');
  }
}

connectDatabase();

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down server...');

  server.close();

  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('MongoDB shutdown error:', err);
  }

  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
