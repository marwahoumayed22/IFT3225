import Measurement from '../models/Measurement';
import Observation from '../models/Observation';
import { buildPortrait, Portrait } from '../services/portrait.service';

export { Portrait };

// Accès aux données pour le portrait d'ambiance courant d'un lieu (fenêtre glissante
// de 15 minutes). Le calcul lui-même (moyenne, classification) vit dans
// services/portrait.service.ts, sous forme de fonction pure testable sans DB.
// Centralisé ici pour être réutilisé par GET /ambiance/:location (portrait détaillé)
// et par GET /locations (classification affichée sur chaque marqueur de la carte).
export async function computePortrait(location: string): Promise<Portrait> {
  const windowMinutes = 15;
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const measurements = await Measurement.find({ location, timestamp: { $gte: since } });
  const lastMeasurement = await Measurement.findOne({ location }).sort({ timestamp: -1 });
  const lastObservation = await Observation.findOne({ location }).sort({ timestamp: -1 });

  return buildPortrait({
    location,
    windowMinutes,
    windowMeasurementValues: measurements.map((m) => m.value),
    lastMeasurementAt: lastMeasurement ? lastMeasurement.timestamp : null,
    lastObservation: lastObservation
      ? { proximity: lastObservation.proximity, vibe: lastObservation.vibe, timestamp: lastObservation.timestamp }
      : null,
  });
}
