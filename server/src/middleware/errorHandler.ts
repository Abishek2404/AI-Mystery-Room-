import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError {
  code: string;
  message: string;
  details?: any[];
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err.message || err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  // Custom app errors with status code
  if (err.statusCode && err.code) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Default server error — never expose internals
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    },
  });
}

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }
}
