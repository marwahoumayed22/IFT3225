"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = requireApiKey;
const Device_1 = __importDefault(require("../models/Device"));
const response_1 = require("../utils/response");
async function requireApiKey(req, res, next) {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            return (0, response_1.sendError)(res, 401, 'MISSING_API_KEY', "L'en-tête x-api-key est requis pour cette opération.");
        }
        const device = await Device_1.default.findOne({ apiKey });
        if (!device) {
            return (0, response_1.sendError)(res, 403, 'INVALID_API_KEY', "La clé API fournie ne correspond à aucun device enregistré.");
        }
        req.device = device;
        next();
    }
    catch (err) {
        next(err);
    }
}
