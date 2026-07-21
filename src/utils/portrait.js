const Measurement = require('../models/Measurement');
const Observation = require('../models/Observation');
const { classifyAudioLevel, average, QUIET_THRESHOLD, LOUD_THRESHOLD } = require('./aggregation');

// Portrait d'ambiance courant d'un lieu (fenêtre glissante de 15 minutes).
// Centralisé ici pour être réutilisé par GET /ambiance/:location (portrait détaillé)
// et par GET /locations (classification affichée sur chaque marqueur de la carte).
async function computePortrait(location) {
  const windowMinutes = 15;
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const measurements = await Measurement.find({ location, timestamp: { $gte: since } });
  const lastMeasurement = await Measurement.findOne({ location }).sort({ timestamp: -1 });
  const lastObservation = await Observation.findOne({ location }).sort({ timestamp: -1 });

  const avg = average(measurements.map((m) => m.value));
  const hasAnyData = Boolean(lastMeasurement || lastObservation);

  return {
    location,
    hasData: hasAnyData,
    windowMinutes,
    sampleCount: measurements.length,
    audio: {
      average: avg,
      classification: hasAnyData ? classifyAudioLevel(avg) : null,
      scale: { unit: 'amplitude_phyphox', quietBelow: QUIET_THRESHOLD, loudAbove: LOUD_THRESHOLD },
    },
    lastObservation: lastObservation
      ? { proximity: lastObservation.proximity, vibe: lastObservation.vibe, timestamp: lastObservation.timestamp }
      : null,
    lastMeasurementAt: lastMeasurement ? lastMeasurement.timestamp : null,
    generatedAt: new Date(),
  };
}

module.exports = { computePortrait };
