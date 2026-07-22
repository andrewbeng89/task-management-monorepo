import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../lib/errors';

/**
 * Central error handler. Maps known error types to consistent JSON responses
 * of shape `{ error: string, details?: unknown }`:
 *   - ZodError                         -> 400 with field-level issues
 *   - HttpError                        -> its own status code
 *   - Prisma P2025 (record not found)  -> 404
 *   - malformed JSON body              -> 400
 *   - anything else                    -> 500
 *
 * Registered after all routes. Express 5 forwards rejected async handlers here
 * automatically, so route handlers can be plain `async` without a wrapper.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express needs the 4-arg signature
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: err.issues });
  }

  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // express.json() throws a SyntaxError with a `body` property on malformed JSON.
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}
