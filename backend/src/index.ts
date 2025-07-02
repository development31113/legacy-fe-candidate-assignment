import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from '@/utils/config';
import logger from '@/utils/logger';
import signatureRoutes from '@/routes/signatureRoutes';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

// Create Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
if (config.helmetEnabled) {
  app.use(helmet());
}

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
if (config.compressionEnabled) {
  app.use(compression());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      status: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req.method, req.url, res.statusCode, duration);
  });
  
  next();
});

// API routes
app.use('/api', signatureRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Web3 Message Signer API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      'POST /api/verify-signature': 'Verify a message signature',
      'GET /api/health': 'Health check',
      'GET /api/info': 'API information',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 CORS Origin: ${config.corsOrigin}`);
  logger.info(`⚡ Rate Limit: ${config.rateLimitMaxRequests} requests per ${config.rateLimitWindowMs / 1000}s`);
});

export default app; 