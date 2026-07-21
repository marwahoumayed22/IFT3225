import express, { Router } from 'express';
import Observation from '../models/Observation';
import Location from '../models/Location';
import requireAuth from '../middlewares/jwtAuth';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

router.use(requireAuth);

// GET /users/me — profil de l'usager connecté
router.get('/me', async (req, res) => {
  const user = req.user!;
  return sendSuccess(res, 200, {
    id: user._id,
    email: user.email,
    name: user.name,
    favoriteLocations: user.favoriteLocations,
  });
});

// GET /users/me/observations — récapitulatif des contributions
router.get('/me/observations', async (req, res, next) => {
  try {
    const observations = await Observation.find({ authorId: req.user!._id }).sort({ timestamp: -1 });
    return sendSuccess(res, 200, observations, { count: observations.length });
  } catch (err) {
    next(err);
  }
});

// GET /users/me/locations — les lieux où l'usager a fait des écoutes (déduits de ses observations)
router.get('/me/locations', async (req, res, next) => {
  try {
    const slugs = await Observation.distinct('location', { authorId: req.user!._id });
    const locations = await Location.find({ slug: { $in: slugs } });
    return sendSuccess(res, 200, locations, { count: locations.length });
  } catch (err) {
    next(err);
  }
});

// POST /users/me/favorites/:slug — ajouter un lieu favori
router.post('/me/favorites/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const location = await Location.findOne({ slug });
    if (!location) {
      return sendError(res, 404, 'LOCATION_NOT_FOUND', `Aucun lieu avec le slug "${slug}".`);
    }

    const user = req.user!;
    if (!user.favoriteLocations.includes(slug)) {
      user.favoriteLocations.push(slug);
      await user.save();
    }

    return sendSuccess(res, 200, { favoriteLocations: user.favoriteLocations });
  } catch (err) {
    next(err);
  }
});

// DELETE /users/me/favorites/:slug — retirer un lieu favori
router.delete('/me/favorites/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const user = req.user!;
    user.favoriteLocations = user.favoriteLocations.filter((s) => s !== slug);
    await user.save();
    return sendSuccess(res, 200, { favoriteLocations: user.favoriteLocations });
  } catch (err) {
    next(err);
  }
});

export default router;
