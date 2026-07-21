"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Observation_1 = __importDefault(require("../models/Observation"));
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const events_1 = __importDefault(require("../utils/events"));
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// POST /observations — Phase 2 : protégé par JWT (usager de l'app cliente),
// remplace la protection x-api-key de la Phase 1 (qui restait pensée pour un device).
// L'observation est liée à son auteur pour le récapitulatif des contributions.
router.post('/', jwtAuth_1.default, async (req, res, next) => {
    try {
        const { location, proximity, vibe, notes, timestamp } = req.body;
        if (!location || proximity === undefined || !vibe || !timestamp) {
            return (0, response_1.sendError)(res, 400, 'VALIDATION_ERROR', 'Les champs location, proximity, vibe et timestamp sont requis.');
        }
        const observation = await Observation_1.default.create({
            location,
            proximity,
            vibe,
            notes,
            timestamp: new Date(timestamp),
            authorId: req.user._id,
        });
        events_1.default.emit('update', { location });
        return (0, response_1.sendSuccess)(res, 201, observation);
    }
    catch (err) {
        next(err);
    }
});
// GET /observations — consultation publique, filtrage par lieu / période
router.get('/', async (req, res, next) => {
    try {
        const { location, from, to } = req.query;
        const filter = {};
        if (location)
            filter.location = location;
        if (from || to) {
            const range = {};
            if (from)
                range.$gte = new Date(from);
            if (to)
                range.$lte = new Date(to);
            filter.timestamp = range;
        }
        const observations = await Observation_1.default.find(filter).sort({ timestamp: -1 }).limit(500);
        return (0, response_1.sendSuccess)(res, 200, observations, { count: observations.length });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
