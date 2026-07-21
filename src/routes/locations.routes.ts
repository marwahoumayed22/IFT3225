import express, { Router } from 'express';
import Location, { LocationDocument } from '../models/Location';
import requireAuth from '../middlewares/jwtAuth';
import ambianceEvents, { AmbianceUpdateEvent } from '../utils/events';
import { computePortrait } from '../utils/portrait';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

async function toMapEntry(location: LocationDocument) {
  const portrait = await computePortrait(location.slug);
  return {
    slug: location.slug,
    name: location.name,
    lat: location.lat,
    lng: location.lng,
    classification: portrait.audio.classification,
    hasData: portrait.hasData,
    lastMeasurementAt: portrait.lastMeasurementAt,
  };
}

// GET /locations/stream — Bonus temps réel (Server-Sent Events).
// Pousse vers le client une mise à jour du lieu concerné dès qu'une nouvelle
// mesure ou observation est reçue (voir utils/events.ts), plutôt que d'obliger
// le client à re-interroger l'API par sondage périodique.
// IMPORTANT : cette route doit être déclarée AVANT GET /:slug pour ne pas être
// interceptée par la route générique (sinon "stream" serait lu comme un slug).
router.get('/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  res.write(': connecté au flux temps réel\n\n');

  const onUpdate = async ({ location: slug }: AmbianceUpdateEvent) => {
    try {
      const location = await Location.findOne({ slug });
      if (!location) return; // mesure sur un lieu sans entité Location : rien à pousser
      const entry = await toMapEntry(location);
      res.write(`data: ${JSON.stringify(entry)}\n\n`);
    } catch {
      // on ignore une erreur ponctuelle de calcul de portrait pour ne pas couper le flux
    }
  };

  ambianceEvents.on('update', onUpdate);

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    ambianceEvents.off('update', onUpdate);
  });
});

// GET /locations — lecture publique.
// Renvoie chaque lieu avec ses coordonnées ET sa classification courante,
// pour que le client affiche directement les marqueurs colorés sur la carte
// sans avoir à interroger /ambiance/:location une par une.
router.get('/', async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    const withPortrait = await Promise.all(locations.map(toMapEntry));
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

export default router;
