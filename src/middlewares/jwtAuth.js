const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

// Protège une route : exige un header Authorization: Bearer <token>.
async function requireAuth(req, res, next) {
  try {
    const header = req.header('authorization') || req.header('Authorization');

    if (!header || !header.startsWith('Bearer ')) {
      return sendError(res, 401, 'MISSING_TOKEN', "Un jeton d'authentification (Bearer) est requis pour cette opération.");
    }

    const token = header.slice('Bearer '.length).trim();

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
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

module.exports = requireAuth;
