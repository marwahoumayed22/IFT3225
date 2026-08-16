import { describe, it, expect } from 'vitest';
import { computeHourlyStats, findQuietHours } from './quietHours.service';

function atHour(hour: number): Date {
  return new Date(Date.UTC(2026, 0, 1, hour, 0, 0));
}

describe('computeHourlyStats', () => {
  it('regroupe les mesures par heure locale', () => {
    const measurements = [
      { value: -60, timestamp: atHour(8) },
      { value: -50, timestamp: atHour(8) },
      { value: -20, timestamp: atHour(14) },
    ];
    const hourly = computeHourlyStats(measurements);
    const h8 = hourly.find((h) => h.hour === 8)!;
    const h14 = hourly.find((h) => h.hour === 14)!;
    expect(h8.sampleCount).toBe(2);
    expect(h14.sampleCount).toBe(1);
  });

  it('retourne un tableau vide sans mesures', () => {
    expect(computeHourlyStats([])).toEqual([]);
  });

  it('trie le résultat par heure croissante', () => {
    const measurements = [
      { value: -60, timestamp: atHour(20) },
      { value: -60, timestamp: atHour(5) },
    ];
    const hourly = computeHourlyStats(measurements);
    expect(hourly.map((h) => h.hour)).toEqual([5, 20]);
  });
});

describe('findQuietHours', () => {
  it('ne retient que les heures classées "calme"', () => {
    const hourly = [
      { hour: 8, average: -60, sampleCount: 1 }, // calme
      { hour: 14, average: -20, sampleCount: 1 }, // animé
      { hour: 20, average: -45, sampleCount: 1 }, // modéré
    ];
    expect(findQuietHours(hourly)).toEqual([8]);
  });

  it('retourne un tableau vide si aucune heure n\'est calme', () => {
    const hourly = [{ hour: 14, average: -20, sampleCount: 1 }];
    expect(findQuietHours(hourly)).toEqual([]);
  });

  it('exclut les heures sans donnée (classification "inconnu")', () => {
    const hourly = [{ hour: 3, average: null, sampleCount: 0 }];
    expect(findQuietHours(hourly)).toEqual([]);
  });
});
