// Seuils de classification du niveau sonore, en dB (échelle Phyphox).
// Valeurs de départ — à recalibrer avec les vraies données de la Tâche 6
// une fois que tu auras collecté au café (voir section "Agrégation" du rapport).
export const QUIET_THRESHOLD = -50;
export const LOUD_THRESHOLD = -35;

export type Classification = 'calme' | 'modere' | 'anime' | 'inconnu';

export function classifyAudioLevel(average: number | null | undefined): Classification {
  if (average === null || average === undefined) return 'inconnu';
  if (average < QUIET_THRESHOLD) return 'calme';
  if (average < LOUD_THRESHOLD) return 'modere';
  return 'anime';
}

export function average(values: number[] | null | undefined): number | null {
  if (!values || values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}
