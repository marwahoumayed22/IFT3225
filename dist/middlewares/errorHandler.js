"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const response_1 = require("../utils/response");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err.name === 'ValidationError') {
        return (0, response_1.sendError)(res, 400, 'VALIDATION_ERROR', 'Les données fournies sont invalides.', err.errors);
    }
    if (err.name === 'CastError') {
        return (0, response_1.sendError)(res, 400, 'INVALID_ID', 'Identifiant invalide.');
    }
    return (0, response_1.sendError)(res, 500, 'INTERNAL_ERROR', 'Une erreur interne est survenue.');
}
