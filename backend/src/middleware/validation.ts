import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types';
import logger from '../utils/logger';

// Validation schemas
const verifySignatureSchema = Joi.object({
  message: Joi.string().required().min(1).max(10000).messages({
    'string.empty': 'Message cannot be empty',
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message cannot exceed 10000 characters',
    'any.required': 'Message is required',
  }),
  signature: Joi.string().required().pattern(/^0x[a-fA-F0-9]{130}$/).messages({
    'string.empty': 'Signature cannot be empty',
    'string.pattern.base': 'Signature must be a valid hex string starting with 0x and 130 characters long',
    'any.required': 'Signature is required',
  }),
});

// Generic validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      logger.warn('Validation failed', {
        path: req.path,
        errors: validationErrors,
        body: req.body,
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Replace request body with validated data
    req.body = value;
    next();
    return undefined;
  };
};

// Specific validation middlewares
export const validateVerifySignature = validateRequest(verifySignatureSchema);

// Sanitization middleware
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  // Trim whitespace from string fields
  if (req.body.message) {
    req.body.message = req.body.message.trim();
  }
  if (req.body.signature) {
    req.body.signature = req.body.signature.trim();
  }

  next();
};

// Rate limiting validation
export const validateRateLimit = (_req: Request, _res: Response, next: NextFunction) => {
  // This would typically be handled by express-rate-limit middleware
  // This is just a placeholder for custom rate limiting logic
  next();
}; 