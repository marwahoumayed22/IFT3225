import { describe, it, expect } from 'vitest';
import { findLoudestMeasurement } from './loudestMoment.service';

describe('findLoudestMeasurement', () => {
  it('retourne la mesure ayant la plus grande valeur', () => {
    const measurements = [{ value: -60 }, { value: -20 }, { value: -45 }];
    expect(findLoudestMeasurement(measurements)).toEqual({ value: -20 });
  });

  it('retourne null pour un tableau vide', () => {
    expect(findLoudestMeasurement([])).toBeNull();
  });

  it('fonctionne avec une seule mesure', () => {
    const measurements = [{ value: -33 }];
    expect(findLoudestMeasurement(measurements)).toEqual({ value: -33 });
  });

  it('conserve la première occurrence en cas d\'égalité', () => {
    const first = { value: -20, tag: 'a' };
    const second = { value: -20, tag: 'b' };
    expect(findLoudestMeasurement([first, second])).toBe(first);
  });
});
