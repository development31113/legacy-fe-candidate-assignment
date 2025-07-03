import { Request, Response } from 'express';
import { VerifySignatureResponse } from '../types';
import SignatureService from '../services/signatureService';
import logger from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';

export class SignatureController {
  /**
   * Verify a message signature
   */
  static verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const { message, signature } = req.body;

    logger.info('Signature verification request', {
      messageLength: message?.length,
      signaturePrefix: signature?.substring(0, 10) + '...',
    });

    // Verify signature using the service
    const result = SignatureService.verifySignature({ message, signature });

    const response: VerifySignatureResponse = {
      isValid: result.isValid,
      signer: result.signer,
      originalMessage: message,
      timestamp: new Date().toISOString(),
    };

    logger.info('Signature verification completed', {
      isValid: result.isValid,
      signer: result.signer,
    });

    res.status(200).json({
      success: true,
      data: response,
    });
  });

  /**
   * Health check endpoint
   */
  static healthCheck = asyncHandler(async (_req: Request, res: Response) => {
    const startTime = process.hrtime.bigint();
    
    // Perform basic health checks
    const healthChecks = {
      database: 'ok', // In a real app, you'd check DB connection
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    };

    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] || '1.0.0',
      uptime: process.uptime(),
      responseTime: `${responseTime.toFixed(2)}ms`,
      checks: healthChecks,
    };

    logger.info('Health check completed', { responseTime });

    res.status(200).json({
      success: true,
      data: response,
    });
  });

  /**
   * Get API information
   */
  static getApiInfo = asyncHandler(async (_req: Request, res: Response) => {
    const apiInfo = {
      name: 'Web3 Message Signer API',
      version: process.env['npm_package_version'] || '1.0.0',
      description: 'API for verifying Ethereum message signatures',
      endpoints: {
        'POST /api/verify-signature': 'Verify a message signature',
        'GET /api/health': 'Health check',
        'GET /api/info': 'API information',
      },
      features: [
        'Ethereum message signature verification',
        'Address recovery from signatures',
        'Input validation and sanitization',
        'Rate limiting',
        'Comprehensive error handling',
      ],
    };

    res.status(200).json({
      success: true,
      data: apiInfo,
    });
  });
}

export default SignatureController; 