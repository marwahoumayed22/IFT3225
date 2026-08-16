// Pure : générique pour rester utilisable avec des documents Mongoose ou de simples objets
// en test. Ne fait aucune hypothèse sur la forme de T au-delà de `value`.
export function findLoudestMeasurement<T extends { value: number }>(measurements: T[]): T | null {
  if (measurements.length === 0) return null;
  return measurements.reduce((loudest, current) => (current.value > loudest.value ? current : loudest));
}
