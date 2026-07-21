"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notFound;
const response_1 = require("../utils/response");
function notFound(req, res) {
    return (0, response_1.sendError)(res, 404, 'NOT_FOUND', `La ressource ${req.method} ${req.originalUrl} n'existe pas.`);
}
