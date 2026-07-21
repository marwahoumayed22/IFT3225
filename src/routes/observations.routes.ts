import express, { Router } from 'express';
import Observation from '../models/Observation';
import requireAuth from '../middlewares/jwtAuth';
import ambianceEvents from '../utils/events';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

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
      authorId: req.user!._id,
    });

    ambianceEvents.emit('update', { location });

    return sendSuccess(res, 201, observation);
  } catch (err) {
    next(err);
  }
});

// GET /observations — consultation publique, filtrage par lieu / période
router.get('/', async (req, res, next) => {
  try {
    const { location, from, to } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = {};

    if (location) filter.location = location;
    if (from || to) {
      const range: Record<string, Date> = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      filter.timestamp = range;
    }

    const observations = await Observation.find(filter).sort({ timestamp: -1 }).limit(500);
    return sendSuccess(res, 200, observations, { count: observations.length });
  } catch (err) {
    next(err);
  }
});

export default router;
