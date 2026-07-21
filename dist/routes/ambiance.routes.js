"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Measurement_1 = __importDefault(require("../models/Measurement"));
const aggregation_1 = require("../utils/aggregation");
const portrait_1 = require("../utils/portrait");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// "3h", "45m", "24h" -> nombre de minutes. Retombe sur fallbackMinutes si invalide/absent.
function parseDuration(str, fallbackMinutes) {
    if (typeof str !== 'string')
        return fallbackMinutes;
    const match = /^(\d+)(m|h)$/.exec(str);
    if (!match)
        return fallbackMinutes;
    const value = Number(match[1]);
    return match[2] === 'h' ? value * 60 : value;
}
// GET /ambiance/:location — portrait actuel (fenêtre glissante de 15 minutes)
router.get('/:location', async (req, res, next) => {
    try {
        const { location } = req.params;
        const portrait = await (0, portrait_1.computePortrait)(location);
        if (!portrait.hasData) {
            return (0, response_1.sendError)(res, 404, 'NO_DATA', `Aucune donnée disponible pour le lieu "${location}".`);
        }
        return (0, response_1.sendSuccess)(res, 200, portrait);
    }
    catch (err) {
        next(err);
    }
});
// GET /ambiance/:location/history?last=3h — évolution par tranches de 15 minutes
router.get('/:location/history', async (req, res, next) => {
    try {
        const { location } = req.params;
        const minutes = parseDuration(req.query.last, 180);
        const since = new Date(Date.now() - minutes * 60 * 1000);
        const bucketMinutes = 15;
        const bucketMs = bucketMinutes * 60 * 1000;
        const measurements = await Measurement_1.default.find({ location, timestamp: { $gte: since } }).sort({
            timestamp: 1,
        });
        const buckets = new Map();
        for (const m of measurements) {
            const bucketStart = Math.floor(m.timestamp.getTime() / bucketMs) * bucketMs;
            if (!buckets.has(bucketStart))
                buckets.set(bucketStart, []);
            buckets.get(bucketStart).push(m.value);
        }
        const history = [...buckets.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([start, values]) => {
            const avg = (0, aggregation_1.average)(values);
            return {
                from: new Date(start),
                to: new Date(start + bucketMs),
                average: avg,
                classification: (0, aggregation_1.classifyAudioLevel)(avg),
                sampleCount: values.length,
            };
        });
        return (0, response_1.sendSuccess)(res, 200, history, { location, windowMinutes: minutes, bucketMinutes });
    }
    catch (err) {
        next(err);
    }
});
// GET /ambiance/:location/quiet-hours — créneaux typiquement calmes (toutes données confondues)
router.get('/:location/quiet-hours', async (req, res, next) => {
    try {
        const { location } = req.params;
        const measurements = await Measurement_1.default.find({ location });
        if (measurements.length === 0) {
            return (0, response_1.sendError)(res, 404, 'NO_DATA', `Aucune mesure disponible pour le lieu "${location}".`);
        }
        const byHour = new Map();
        for (const m of measurements) {
            const hour = m.timestamp.getHours();
            if (!byHour.has(hour))
                byHour.set(hour, []);
            byHour.get(hour).push(m.value);
        }
        const hourly = [...byHour.entries()]
            .map(([hour, values]) => ({ hour, average: (0, aggregation_1.average)(values), sampleCount: values.length }))
            .sort((a, b) => a.hour - b.hour);
        const quietHours = hourly.filter((h) => (0, aggregation_1.classifyAudioLevel)(h.average) === 'calme').map((h) => h.hour);
        return (0, response_1.sendSuccess)(res, 200, { location, hourly, quietHours });
    }
    catch (err) {
        next(err);
    }
});
// GET /ambiance/:location/loudest-moment?last=24h — pic de bruit sur la période
router.get('/:location/loudest-moment', async (req, res, next) => {
    try {
        const { location } = req.params;
        const minutes = parseDuration(req.query.last, 1440);
        const since = new Date(Date.now() - minutes * 60 * 1000);
        const loudest = await Measurement_1.default.find({ location, timestamp: { $gte: since } })
            .sort({ value: -1 })
            .limit(1);
        if (loudest.length === 0) {
            return (0, response_1.sendError)(res, 404, 'NO_DATA', `Aucune mesure disponible pour le lieu "${location}" sur cette période.`);
        }
        return (0, response_1.sendSuccess)(res, 200, loudest[0], { windowMinutes: minutes });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
