// Seuils de classification du niveau sonore, en dB (échelle Phyphox).
// Valeurs de départ — à recalibrer avec les vraies données de la Tâche 6
// une fois que tu auras collecté au café (voir section "Agrégation" du rapport).
const QUIET_THRESHOLD = -50;
const LOUD_THRESHOLD = -35;

function classifyAudioLevel(average) {
  if (average === null || average === undefined) return 'inconnu';
  if (average < QUIET_THRESHOLD) return 'calme';
  if (average < LOUD_THRESHOLD) return 'modere';
  return 'bruyant';
}

function average(values) {
  if (!values || values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

module.exports = { classifyAudioLevel, average, QUIET_THRESHOLD, LOUD_THRESHOLD };
