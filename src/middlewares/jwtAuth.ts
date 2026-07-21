import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendError } from '../utils/response';

interface JwtPayload {
  sub: string;
}

// Protège une route : exige un header Authorization: Bearer <token>.
export default async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization') || req.header('Authorization');

    if (!header || !header.startsWith('Bearer ')) {
      return sendError(res, 401, 'MISSING_TOKEN', "Un jeton d'authentification (Bearer) est requis pour cette opération.");
    }

    const token = header.slice('Bearer '.length).trim();

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch {
      return sendError(res, 401, 'INVALID_TOKEN', 'Le jeton fourni est invalide ou expiré.');
    }

    const user = await User.findById(payload.sub).select('-passwordHash');
    if (!user) {
      return sendError(res, 401, 'INVALID_TOKEN', "L'usager associé à ce jeton n'existe plus.");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
