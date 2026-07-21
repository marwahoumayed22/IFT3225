"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Device_1 = __importDefault(require("../models/Device"));
const apiKey_1 = require("../utils/apiKey");
const response_1 = require("../utils/response");
const router = express_1.default.Router();
// POST /devices
// ⚠️ Volontairement NON protégé en Phase 1 — vulnérabilité intentionnelle.
// Voir rapport, section "Authentification" pour l'analyse et la solution proposée.
router.post('/', async (req, res, next) => {
    try {
        const { name, location } = req.body;
        if (!name || !location) {
            return (0, response_1.sendError)(res, 400, 'VALIDATION_ERROR', 'Les champs name et location sont requis.');
        }
        const apiKey = (0, apiKey_1.generateApiKey)();
        const device = await Device_1.default.create({ name, location, apiKey });
        return (0, response_1.sendSuccess)(res, 201, {
            id: device._id,
            name: device.name,
            location: device.location,
            apiKey: device.apiKey,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /devices — lecture publique. La clé API n'est jamais incluse dans la liste.
router.get('/', async (req, res, next) => {
    try {
        const devices = await Device_1.default.find().select('-apiKey');
        return (0, response_1.sendSuccess)(res, 200, devices);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
