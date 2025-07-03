import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import logger from '../utils/logger';

// Custom error class
export class AppError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  } else {
    // Handle unexpected errors
    apiError = {
      message: process.env['NODE_ENV'] === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
      status: 500,
      details: process.env['NODE_ENV'] === 'development' ? error.stack : undefined,
    };
  }

  // Log error
  logger.error('API Error', {
    error: apiError,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  res.status(apiError.status).json({
    success: false,
    error: apiError,
  });
};

// 404 handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.method} ${req.url} not found`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request timeout handler
export const timeoutHandler = (timeout: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      const error = new AppError(
        'Request timeout',
        408,
        'TIMEOUT'
      );
      next(error);
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
}; 