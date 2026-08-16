import express, { Router } from 'express';
import Measurement from '../models/Measurement';
import { computePortrait } from '../utils/portrait';
import { parseDuration } from '../services/duration.service';
import { bucketMeasurements } from '../services/history.service';
import { computeHourlyStats, findQuietHours } from '../services/quietHours.service';
import { findLoudestMeasurement } from '../services/loudestMoment.service';
import { suggestNextQuietWindow } from '../services/studySuggestion.service';
import { cacheResponse } from '../middlewares/cache';
import { sendSuccess, sendError } from '../utils/response';

const router: Router = express.Router();

// Stratégie de cache (Tâche 4) : chaque route a son propre TTL selon la volatilité
// de ce qu'elle sert. Voir la description complète dans le rapport. En bref :
// - portrait (fenêtre 15 min) : TTL court, les capteurs envoient en continu
// - history / loudest-moment : dépendent d'une fenêtre glissante, TTL court à moyen
// - quiet-hours : agrège TOUT l'historique (requête coûteuse), évolue lentement -> TTL plus long
// - best-study-time : dérive de quiet-hours + heure courante, TTL moyen
// Toutes les clés sont préfixées par le lieu pour permettre une invalidation ciblée
// (voir utils/cacheInvalidation.ts) dès qu'une nouvelle mesure/observation arrive.

// GET /ambiance/:location — portrait actuel (fenêtre glissante de 15 minutes)
router.get(
  '/:location',
  cacheResponse((req) => `ambiance:${req.params.location}:portrait`, 15_000),
  async (req, res, next) => {
    try {
      const location = String(req.params.location);
      const portrait = await computePortrait(location);

      if (!portrait.hasData) {
        return sendError(res, 404, 'NO_DATA', `Aucune donnée disponible pour le lieu "${location}".`);
      }

      return sendSuccess(res, 200, portrait);
    } catch (err) {
      next(err);
    }
  }
);

// GET /ambiance/:location/history?last=3h — évolution par tranches de 15 minutes
router.get(
  '/:location/history',
  cacheResponse((req) => `ambiance:${req.params.location}:history:${String(req.query.last ?? 'default')}`, 30_000),
  async (req, res, next) => {
    try {
      const location = String(req.params.location);
      const minutes = parseDuration(req.query.last, 180);
      const since = new Date(Date.now() - minutes * 60 * 1000);
      const bucketMinutes = 15;

      const measurements = await Measurement.find({ location, timestamp: { $gte: since } }).sort({
        timestamp: 1,
      });

      const history = bucketMeasurements(measurements, bucketMinutes);

      return sendSuccess(res, 200, history, { location, windowMinutes: minutes, bucketMinutes });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ambiance/:location/quiet-hours — créneaux typiquement calmes (toutes données confondues)
router.get(
  '/:location/quiet-hours',
  cacheResponse((req) => `ambiance:${req.params.location}:quiet-hours`, 300_000),
  async (req, res, next) => {
    try {
      const location = String(req.params.location);
      const measurements = await Measurement.find({ location });

      if (measurements.length === 0) {
        return sendError(res, 404, 'NO_DATA', `Aucune mesure disponible pour le lieu "${location}".`);
      }

      const hourly = computeHourlyStats(measurements);
      const quietHours = findQuietHours(hourly);

      return sendSuccess(res, 200, { location, hourly, quietHours });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ambiance/:location/best-study-time — fonctionnalité additionnelle (Tâche 1) :
// prochain créneau typiquement calme, à partir de l'historique complet des mesures.
// Réutilise directement computeHourlyStats/findQuietHours (déjà utilisés par /quiet-hours)
// plutôt que de refaire le calcul, pour rester cohérent avec les créneaux affichés ailleurs.
// TTL de 2 min : la suggestion dépend de l'heure courante, un léger décalage entre deux
// requêtes rapprochées est sans conséquence vu la granularité horaire du calcul.
router.get(
  '/:location/best-study-time',
  cacheResponse((req) => `ambiance:${req.params.location}:best-study-time`, 120_000),
  async (req, res, next) => {
    try {
      const location = String(req.params.location);
      const measurements = await Measurement.find({ location });

      if (measurements.length === 0) {
        return sendError(res, 404, 'NO_DATA', `Aucune mesure disponible pour le lieu "${location}".`);
      }

      const hourly = computeHourlyStats(measurements);
      const quietHours = findQuietHours(hourly);
      const currentHour = new Date().getHours();
      const suggestion = suggestNextQuietWindow(quietHours, currentHour);

      return sendSuccess(res, 200, suggestion, { location, currentHour });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ambiance/:location/loudest-moment?last=24h — pic de bruit sur la période
router.get(
  '/:location/loudest-moment',
  cacheResponse((req) => `ambiance:${req.params.location}:loudest-moment:${String(req.query.last ?? 'default')}`, 30_000),
  async (req, res, next) => {
    try {
      const location = String(req.params.location);
      const minutes = parseDuration(req.query.last, 1440);
      const since = new Date(Date.now() - minutes * 60 * 1000);

      const measurements = await Measurement.find({ location, timestamp: { $gte: since } });
      const loudest = findLoudestMeasurement(measurements);

      if (!loudest) {
        return sendError(
          res,
          404,
          'NO_DATA',
          `Aucune mesure disponible pour le lieu "${location}" sur cette période.`
        );
      }

      return sendSuccess(res, 200, loudest, { windowMinutes: minutes });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
