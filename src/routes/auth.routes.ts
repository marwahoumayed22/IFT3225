import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

function signToken(user: UserDocument): string {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

function toPublicUser(user: UserDocument) {
  return { id: user._id, email: user.email, name: user.name };
}

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Les champs email, password et name sont requis.');
    }
    if (password.length < 6) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Le mot de passe doit contenir au moins 6 caractères.');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 409, 'EMAIL_TAKEN', 'Un compte existe déjà avec cet email.');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name });

    const token = signToken(user);
    return sendSuccess(res, 201, { token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Les champs email et password sont requis.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return sendError(res, 401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
    }

    const token = signToken(user);
    return sendSuccess(res, 200, { token, user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
