/**
 * Application-level HTTP error. Services throw these to signal a specific
 * status code; the central error handler turns them into JSON responses.
 */
export class HttpError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFound = (message: string) => new HttpError(404, message);
export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);
export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, message, details);
