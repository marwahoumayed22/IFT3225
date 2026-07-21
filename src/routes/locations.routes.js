const express = require('express');
const Location = require('../models/Location');
const requireAuth = require('../middlewares/jwtAuth');
const { computePortrait } = require('../utils/portrait');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// GET /locations — lecture publique.
// Renvoie chaque lieu avec ses coordonnées ET sa classification courante,
// pour que le client affiche directement les marqueurs colorés sur la carte
// sans avoir à interroger /ambiance/:location une par une.
router.get('/', async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });

    const withPortrait = await Promise.all(
      locations.map(async (loc) => {
        const portrait = await computePortrait(loc.slug);
        return {
          slug: loc.slug,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          classification: portrait.audio.classification,
          hasData: portrait.hasData,
          lastMeasurementAt: portrait.lastMeasurementAt,
        };
      })
    );

    return sendSuccess(res, 200, withPortrait, { count: withPortrait.length });
  } catch (err) {
    next(err);
  }
});

// GET /locations/:slug — détail d'un lieu (sans le portrait complet, voir /ambiance/:location pour ça)
router.get('/:slug', async (req, res, next) => {
  try {
    const location = await Location.findOne({ slug: req.params.slug });
    if (!location) {
      return sendError(res, 404, 'LOCATION_NOT_FOUND', `Aucun lieu avec le slug "${req.params.slug}".`);
    }
    return sendSuccess(res, 200, location);
  } catch (err) {
    next(err);
  }
});

// POST /locations — protégé (JWT). Permet à un usager connecté d'ajouter un lieu
// (ex: un nouvel endroit où il fait des écoutes) avec ses coordonnées.
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { slug, name, lat, lng } = req.body;

    if (!slug || !name || lat === undefined || lng === undefined) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Les champs slug, name, lat et lng sont requis.');
    }

    const existing = await Location.findOne({ slug });
    if (existing) {
      return sendError(res, 409, 'LOCATION_EXISTS', `Le lieu "${slug}" existe déjà.`);
    }

    const location = await Location.create({ slug, name, lat, lng });
    return sendSuccess(res, 201, location);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
