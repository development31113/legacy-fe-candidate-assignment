// Request/Response Types
export interface VerifySignatureRequest {
  message: string;
  signature: string;
}

export interface VerifySignatureResponse {
  isValid: boolean;
  signer: string;
  originalMessage: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Middleware Types
export interface RequestWithUser extends Request {
  user?: any;
  ip?: string;
}

// Service Types
export interface SignatureVerificationResult {
  isValid: boolean;
  signer: string;
  error?: string;
}

// Configuration Types
export interface ServerConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  helmetEnabled: boolean;
  compressionEnabled: boolean;
}

// Logging Types
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any;
}

// Express Extensions
declare global {
  namespace Express {
    interface Request {
      user?: any;
      ip?: string;
    }
  }
} 