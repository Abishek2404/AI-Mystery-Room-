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

// Rate limiting for case generation
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait before trying again.' },
  },
});
app.use('/api/cases', (req, _res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return generateLimiter(req, _res, next);
  }
  next();
});

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/cases', caseRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
