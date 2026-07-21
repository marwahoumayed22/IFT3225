import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface KnownError extends Error {
  name: string;
  errors?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function errorHandler(err: KnownError, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Les données fournies sont invalides.', err.errors);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'INVALID_ID', 'Identifiant invalide.');
  }

  return sendError(res, 500, 'INTERNAL_ERROR', 'Une erreur interne est survenue.');
}
