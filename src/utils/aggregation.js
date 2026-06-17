// Seuils de classification du niveau sonore.
// Ces valeurs sont des points de départ — à recalibrer une fois les vraies
// données de la Tâche 6 collectées (l'amplitude Phyphox dépend du modèle de
// téléphone et de l'expérience choisie). Voir section "Agrégation" du rapport.
const QUIET_THRESHOLD = 0.1;
const LOUD_THRESHOLD = 0.4;

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
