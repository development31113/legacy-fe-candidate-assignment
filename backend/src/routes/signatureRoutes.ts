import { Router } from 'express';
import SignatureController from '@/controllers/signatureController';
import { validateVerifySignature, sanitizeInput } from '@/middleware/validation';
import { timeoutHandler } from '@/middleware/errorHandler';

const router = Router();

// Apply timeout middleware to all routes
router.use(timeoutHandler(30000)); // 30 seconds timeout

/**
 * @route POST /api/verify-signature
 * @desc Verify a message signature
 * @access Public
 */
router.post(
  '/verify-signature',
  sanitizeInput,
  validateVerifySignature,
  SignatureController.verifySignature
);

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', SignatureController.healthCheck);

/**
 * @route GET /api/info
 * @desc Get API information
 * @access Public
 */
router.get('/info', SignatureController.getApiInfo);

export default router; 