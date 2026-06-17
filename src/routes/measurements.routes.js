const express = require('express');
const Measurement = require('../models/Measurement');
const requireApiKey = require('../middlewares/auth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// POST /measurements — protégé par x-api-key
router.post('/', requireApiKey, async (req, res, next) => {
  try {
    const { type, value, location, timestamp } = req.body;

    if (!type || value === undefined || !location || !timestamp) {
      return sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'Les champs type, value, location et timestamp sont requis.'
      );
    }

    const measurement = await Measurement.create({
      type,
      value,
      location,
      timestamp: new Date(timestamp),
      deviceId: req.device._id,
    });

    return sendSuccess(res, 201, measurement);
  } catch (err) {
    next(err);
  }
});

// GET /measurements — consultation publique, filtrage par lieu / type / période
router.get('/', async (req, res, next) => {
  try {
    const { location, type, from, to } = req.query;
    const filter = {};

    if (location) filter.location = location;
    if (type) filter.type = type;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const measurements = await Measurement.find(filter).sort({ timestamp: -1 }).limit(500);
    return sendSuccess(res, 200, measurements, { count: measurements.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
