const express = require('express');
const Observation = require('../models/Observation');
const Location = require('../models/Location');
const requireAuth = require('../middlewares/jwtAuth');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.use(requireAuth);

// GET /users/me — profil de l'usager connecté
router.get('/me', async (req, res) => {
  return sendSuccess(res, 200, {
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    favoriteLocations: req.user.favoriteLocations,
  });
});

// GET /users/me/observations — récapitulatif des contributions
router.get('/me/observations', async (req, res, next) => {
  try {
    const observations = await Observation.find({ authorId: req.user._id }).sort({ timestamp: -1 });
    return sendSuccess(res, 200, observations, { count: observations.length });
  } catch (err) {
    next(err);
  }
});

// GET /users/me/locations — les lieux où l'usager a fait des écoutes (déduits de ses observations)
router.get('/me/locations', async (req, res, next) => {
  try {
    const slugs = await Observation.distinct('location', { authorId: req.user._id });
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

    if (!req.user.favoriteLocations.includes(slug)) {
      req.user.favoriteLocations.push(slug);
      await req.user.save();
    }

    return sendSuccess(res, 200, { favoriteLocations: req.user.favoriteLocations });
  } catch (err) {
    next(err);
  }
});

// DELETE /users/me/favorites/:slug — retirer un lieu favori
router.delete('/me/favorites/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    req.user.favoriteLocations = req.user.favoriteLocations.filter((s) => s !== slug);
    await req.user.save();
    return sendSuccess(res, 200, { favoriteLocations: req.user.favoriteLocations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
