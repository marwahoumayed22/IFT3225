const express = require('express');
const Observation = require('../models/Observation');
const requireApiKey = require('../middlewares/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// POST /observations — protégé par x-api-key
router.post('/', requireApiKey, async (req, res, next) => {
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
      deviceId: req.device._id,
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
