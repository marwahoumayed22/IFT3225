import { Request, Response } from 'express';
import { sendError } from '../utils/response';

export default function notFound(req: Request, res: Response) {
  return sendError(res, 404, 'NOT_FOUND', `La ressource ${req.method} ${req.originalUrl} n'existe pas.`);
}
