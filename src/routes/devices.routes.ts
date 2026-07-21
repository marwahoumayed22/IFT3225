import express, { Router } from 'express';
import Device from '../models/Device';
import { generateApiKey } from '../utils/apiKey';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

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

export default router;
