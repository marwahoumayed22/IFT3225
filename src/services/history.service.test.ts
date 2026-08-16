import { describe, it, expect } from 'vitest';
import { bucketMeasurements } from './history.service';

function at(isoMinuteOffset: number): Date {
  // Base fixe pour des tests déterministes : 2026-01-01T00:00:00Z + offset en minutes.
  return new Date(Date.UTC(2026, 0, 1, 0, isoMinuteOffset));
}

describe('bucketMeasurements', () => {
  it('regroupe des mesures dans la même tranche de 15 minutes', () => {
    const measurements = [
      { value: -60, timestamp: at(0) },
      { value: -50, timestamp: at(5) },
      { value: -40, timestamp: at(10) },
    ];
    const buckets = bucketMeasurements(measurements, 15);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].sampleCount).toBe(3);
    expect(buckets[0].average).toBeCloseTo(-50);
  });

  it('sépare des mesures situées dans des tranches différentes, triées chronologiquement', () => {
    const measurements = [
      { value: -30, timestamp: at(20) }, // 2e tranche, ajoutée en premier volontairement
      { value: -60, timestamp: at(0) }, // 1ère tranche
    ];
    const buckets = bucketMeasurements(measurements, 15);
    expect(buckets).toHaveLength(2);
    expect(buckets[0].from.getTime()).toBeLessThan(buckets[1].from.getTime());
  });

  it('retourne un tableau vide quand aucune mesure n\'est fournie', () => {
    expect(bucketMeasurements([], 15)).toEqual([]);
  });

  it('calcule la classification par tranche indépendamment des autres tranches', () => {
    const measurements = [
      { value: -60, timestamp: at(0) }, // calme
      { value: -20, timestamp: at(20) }, // animé
    ];
    const buckets = bucketMeasurements(measurements, 15);
    expect(buckets[0].classification).toBe('calme');
    expect(buckets[1].classification).toBe('anime');
  });
});
