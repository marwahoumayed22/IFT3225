"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Measurement_1 = __importDefault(require("../models/Measurement"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const events_1 = __importDefault(require("../utils/events"));
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// POST /measurements — protégé par x-api-key
router.post('/', auth_1.default, async (req, res, next) => {
    try {
        const { type, value, location, timestamp } = req.body;
        if (!type || value === undefined || !location || !timestamp) {
            return (0, response_1.sendError)(res, 400, 'VALIDATION_ERROR', 'Les champs type, value, location et timestamp sont requis.');
        }
        const measurement = await Measurement_1.default.create({
            type,
            value,
            location,
            timestamp: new Date(timestamp),
            deviceId: req.device._id,
        });
        events_1.default.emit('update', { location });
        return (0, response_1.sendSuccess)(res, 201, measurement);
    }
    catch (err) {
        next(err);
    }
});
// GET /measurements — consultation publique, filtrage par lieu / type / période
router.get('/', async (req, res, next) => {
    try {
        const { location, type, from, to } = req.query;
        const filter = {};
        if (location)
            filter.location = location;
        if (type)
            filter.type = type;
        if (from || to) {
            const range = {};
            if (from)
                range.$gte = new Date(from);
            if (to)
                range.$lte = new Date(to);
            filter.timestamp = range;
        }
        const measurements = await Measurement_1.default.find(filter).sort({ timestamp: -1 }).limit(500);
        return (0, response_1.sendSuccess)(res, 200, measurements, { count: measurements.length });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
