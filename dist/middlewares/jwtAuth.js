"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
// Protège une route : exige un header Authorization: Bearer <token>.
async function requireAuth(req, res, next) {
    try {
        const header = req.header('authorization') || req.header('Authorization');
        if (!header || !header.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 401, 'MISSING_TOKEN', "Un jeton d'authentification (Bearer) est requis pour cette opération.");
        }
        const token = header.slice('Bearer '.length).trim();
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch {
            return (0, response_1.sendError)(res, 401, 'INVALID_TOKEN', 'Le jeton fourni est invalide ou expiré.');
        }
        const user = await User_1.default.findById(payload.sub).select('-passwordHash');
        if (!user) {
            return (0, response_1.sendError)(res, 401, 'INVALID_TOKEN', "L'usager associé à ce jeton n'existe plus.");
        }
        req.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
}
