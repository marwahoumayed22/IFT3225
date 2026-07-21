"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Observation_1 = __importDefault(require("../models/Observation"));
const Location_1 = __importDefault(require("../models/Location"));
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const response_1 = require("../utils/response");
const router = express_1.default.Router();
router.use(jwtAuth_1.default);
// GET /users/me — profil de l'usager connecté
router.get('/me', async (req, res) => {
    const user = req.user;
    return (0, response_1.sendSuccess)(res, 200, {
        id: user._id,
        email: user.email,
        name: user.name,
        favoriteLocations: user.favoriteLocations,
    });
});
// GET /users/me/observations — récapitulatif des contributions
router.get('/me/observations', async (req, res, next) => {
    try {
        const observations = await Observation_1.default.find({ authorId: req.user._id }).sort({ timestamp: -1 });
        return (0, response_1.sendSuccess)(res, 200, observations, { count: observations.length });
    }
    catch (err) {
        next(err);
    }
});
// GET /users/me/locations — les lieux où l'usager a fait des écoutes (déduits de ses observations)
router.get('/me/locations', async (req, res, next) => {
    try {
        const slugs = await Observation_1.default.distinct('location', { authorId: req.user._id });
        const locations = await Location_1.default.find({ slug: { $in: slugs } });
        return (0, response_1.sendSuccess)(res, 200, locations, { count: locations.length });
    }
    catch (err) {
        next(err);
    }
});
// POST /users/me/favorites/:slug — ajouter un lieu favori
router.post('/me/favorites/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const location = await Location_1.default.findOne({ slug });
        if (!location) {
            return (0, response_1.sendError)(res, 404, 'LOCATION_NOT_FOUND', `Aucun lieu avec le slug "${slug}".`);
        }
        const user = req.user;
        if (!user.favoriteLocations.includes(slug)) {
            user.favoriteLocations.push(slug);
            await user.save();
        }
        return (0, response_1.sendSuccess)(res, 200, { favoriteLocations: user.favoriteLocations });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /users/me/favorites/:slug — retirer un lieu favori
router.delete('/me/favorites/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const user = req.user;
        user.favoriteLocations = user.favoriteLocations.filter((s) => s !== slug);
        await user.save();
        return (0, response_1.sendSuccess)(res, 200, { favoriteLocations: user.favoriteLocations });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
