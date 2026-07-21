"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePortrait = computePortrait;
const Measurement_1 = __importDefault(require("../models/Measurement"));
const Observation_1 = __importDefault(require("../models/Observation"));
const aggregation_1 = require("./aggregation");
// Portrait d'ambiance courant d'un lieu (fenêtre glissante de 15 minutes).
// Centralisé ici pour être réutilisé par GET /ambiance/:location (portrait détaillé)
// et par GET /locations (classification affichée sur chaque marqueur de la carte).
async function computePortrait(location) {
    const windowMinutes = 15;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const measurements = await Measurement_1.default.find({ location, timestamp: { $gte: since } });
    const lastMeasurement = await Measurement_1.default.findOne({ location }).sort({ timestamp: -1 });
    const lastObservation = await Observation_1.default.findOne({ location }).sort({ timestamp: -1 });
    const avg = (0, aggregation_1.average)(measurements.map((m) => m.value));
    const hasAnyData = Boolean(lastMeasurement || lastObservation);
    return {
        location,
        hasData: hasAnyData,
        windowMinutes,
        sampleCount: measurements.length,
        audio: {
            average: avg,
            classification: hasAnyData ? (0, aggregation_1.classifyAudioLevel)(avg) : null,
            scale: { unit: 'amplitude_phyphox', quietBelow: aggregation_1.QUIET_THRESHOLD, loudAbove: aggregation_1.LOUD_THRESHOLD },
        },
        lastObservation: lastObservation
            ? { proximity: lastObservation.proximity, vibe: lastObservation.vibe, timestamp: lastObservation.timestamp }
            : null,
        lastMeasurementAt: lastMeasurement ? lastMeasurement.timestamp : null,
        generatedAt: new Date(),
    };
}
