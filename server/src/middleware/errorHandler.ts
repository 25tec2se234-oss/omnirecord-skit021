import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { isProd } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Handle JSON Syntax Errors (malformed payload)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Malformed JSON payload provided in request.'
    });
    return;
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      error: 'File upload exceeds maximum allowed file size.'
    });
    return;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      error: 'Unexpected file field in upload request.'
    });
    return;
  }

  if (err.message && err.message.includes('Invalid file format')) {
    res.status(400).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A resource with this identifier or unique attribute already exists.'
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Requested record was not found.'
    });
    return;
  }

  console.error('Unhandled Server Error:', {
    message: err.message,
    stack: isProd ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(err.status || 500).json({
    success: false,
    error: isProd ? 'An unexpected internal error occurred.' : err.message || 'Internal Server Error'
  });
}
