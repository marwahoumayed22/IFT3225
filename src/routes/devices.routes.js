const express = require('express');
const Device = require('../models/Device');
const { generateApiKey } = require('../utils/apiKey');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

// POST /devices
// ⚠️ Volontairement NON protégé en Phase 1 — vulnérabilité intentionnelle.
// Voir rapport, section "Authentification" pour l'analyse et la solution proposée.
router.post('/', async (req, res, next) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Les champs name et location sont requis.');
    }

    const apiKey = generateApiKey();
    const device = await Device.create({ name, location, apiKey });

    return sendSuccess(res, 201, {
      id: device._id,
      name: device.name,
      location: device.location,
      apiKey: device.apiKey,
    });
  } catch (err) {
    next(err);
  }
});

// GET /devices — lecture publique. La clé API n'est jamais incluse dans la liste.
router.get('/', async (req, res, next) => {
  try {
    const devices = await Device.find().select('-apiKey');
    return sendSuccess(res, 200, devices);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
