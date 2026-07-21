"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Location_1 = __importDefault(require("../models/Location"));
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const events_1 = __importDefault(require("../utils/events"));
const portrait_1 = require("../utils/portrait");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
async function toMapEntry(location) {
    const portrait = await (0, portrait_1.computePortrait)(location.slug);
    return {
        slug: location.slug,
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        classification: portrait.audio.classification,
        hasData: portrait.hasData,
        lastMeasurementAt: portrait.lastMeasurementAt,
    };
}
// GET /locations/stream — Bonus temps réel (Server-Sent Events).
// Pousse vers le client une mise à jour du lieu concerné dès qu'une nouvelle
// mesure ou observation est reçue (voir utils/events.ts), plutôt que d'obliger
// le client à re-interroger l'API par sondage périodique.
// IMPORTANT : cette route doit être déclarée AVANT GET /:slug pour ne pas être
// interceptée par la route générique (sinon "stream" serait lu comme un slug).
router.get('/stream', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.flushHeaders();
    res.write(': connecté au flux temps réel\n\n');
    const onUpdate = async ({ location: slug }) => {
        try {
            const location = await Location_1.default.findOne({ slug });
            if (!location)
                return; // mesure sur un lieu sans entité Location : rien à pousser
            const entry = await toMapEntry(location);
            res.write(`data: ${JSON.stringify(entry)}\n\n`);
        }
        catch {
            // on ignore une erreur ponctuelle de calcul de portrait pour ne pas couper le flux
        }
    };
    events_1.default.on('update', onUpdate);
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => {
        clearInterval(heartbeat);
        events_1.default.off('update', onUpdate);
    });
});
// GET /locations — lecture publique.
// Renvoie chaque lieu avec ses coordonnées ET sa classification courante,
// pour que le client affiche directement les marqueurs colorés sur la carte
// sans avoir à interroger /ambiance/:location une par une.
router.get('/', async (req, res, next) => {
    try {
        const locations = await Location_1.default.find().sort({ name: 1 });
        const withPortrait = await Promise.all(locations.map(toMapEntry));
        return (0, response_1.sendSuccess)(res, 200, withPortrait, { count: withPortrait.length });
    }
    catch (err) {
        next(err);
    }
});
// GET /locations/:slug — détail d'un lieu (sans le portrait complet, voir /ambiance/:location pour ça)
router.get('/:slug', async (req, res, next) => {
    try {
        const location = await Location_1.default.findOne({ slug: req.params.slug });
        if (!location) {
            return (0, response_1.sendError)(res, 404, 'LOCATION_NOT_FOUND', `Aucun lieu avec le slug "${req.params.slug}".`);
        }
        return (0, response_1.sendSuccess)(res, 200, location);
    }
    catch (err) {
        next(err);
    }
});
// POST /locations — protégé (JWT). Permet à un usager connecté d'ajouter un lieu
// (ex: un nouvel endroit où il fait des écoutes) avec ses coordonnées.
router.post('/', jwtAuth_1.default, async (req, res, next) => {
    try {
        const { slug, name, lat, lng } = req.body;
        if (!slug || !name || lat === undefined || lng === undefined) {
            return (0, response_1.sendError)(res, 400, 'VALIDATION_ERROR', 'Les champs slug, name, lat et lng sont requis.');
        }
        const existing = await Location_1.default.findOne({ slug });
        if (existing) {
            return (0, response_1.sendError)(res, 409, 'LOCATION_EXISTS', `Le lieu "${slug}" existe déjà.`);
        }
        const location = await Location_1.default.create({ slug, name, lat, lng });
        return (0, response_1.sendSuccess)(res, 201, location);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
