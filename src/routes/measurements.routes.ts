import express, { Router } from 'express';
import Measurement from '../models/Measurement';
import requireApiKey from '../middlewares/auth';
import ambianceEvents from '../utils/events';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

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
      deviceId: req.device!._id,
    });

    ambianceEvents.emit('update', { location });

    return sendSuccess(res, 201, measurement);
  } catch (err) {
    next(err);
  }
});

// GET /measurements — consultation publique, filtrage par lieu / type / période
router.get('/', async (req, res, next) => {
  try {
    const { location, type, from, to } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};

    if (location) filter.location = location;
    if (type) filter.type = type;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      filter.timestamp = range;
    }

    const measurements = await Measurement.find(filter).sort({ timestamp: -1 }).limit(500);
    return sendSuccess(res, 200, measurements, { count: measurements.length });
  } catch (err) {
    next(err);
  }
});

export default router;
