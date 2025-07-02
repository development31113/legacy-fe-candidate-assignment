import dotenv from 'dotenv';
import { ServerConfig } from '@/types';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: ServerConfig = {
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  helmetEnabled: process.env['HELMET_ENABLED'] !== 'false',
  compressionEnabled: process.env['COMPRESSION_ENABLED'] !== 'false',
};

// Validate configuration
if (config.port < 1 || config.port > 65535) {
  throw new Error('Invalid PORT configuration');
}

if (config.rateLimitWindowMs < 1000) {
  throw new Error('RATE_LIMIT_WINDOW_MS must be at least 1000ms');
}

if (config.rateLimitMaxRequests < 1) {
  throw new Error('RATE_LIMIT_MAX_REQUESTS must be at least 1');
}

export default config; 