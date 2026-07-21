const express = require('express');
const Observation = require('../models/Observation');
const requireAuth = require('../middlewares/jwtAuth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// POST /observations — Phase 2 : protégé par JWT (usager de l'app cliente),
// remplace la protection x-api-key de la Phase 1 (qui restait pensée pour un device).
// L'observation est liée à son auteur pour le récapitulatif des contributions.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { location, proximity, vibe, notes, timestamp } = req.body;

    if (!location || proximity === undefined || !vibe || !timestamp) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Les champs location, proximity, vibe et timestamp sont requis.'
      );
    }

    const observation = await Observation.create({
      location,
      proximity,
      vibe,
      notes,
      timestamp: new Date(timestamp),
      authorId: req.user._id,
    });

    return sendSuccess(res, 201, observation);
  } catch (err) {
    next(err);
  }
});

// GET /observations — consultation publique, filtrage par lieu / période
router.get('/', async (req, res, next) => {
  try {
    const { location, from, to } = req.query;
    const filter = {};

    if (location) filter.location = location;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const observations = await Observation.find(filter).sort({ timestamp: -1 }).limit(500);
    return sendSuccess(res, 200, observations, { count: observations.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
