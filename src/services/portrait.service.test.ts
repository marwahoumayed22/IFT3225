import { describe, it, expect } from 'vitest';
import { buildPortrait } from './portrait.service';

describe('buildPortrait', () => {
  it('calcule la moyenne et la classification à partir des mesures de la fenêtre', () => {
    const portrait = buildPortrait({
      location: 'cafe-plateau',
      windowMinutes: 15,
      windowMeasurementValues: [-60, -55],
      lastMeasurementAt: new Date('2026-01-01T10:00:00Z'),
      lastObservation: null,
    });
    expect(portrait.hasData).toBe(true);
    expect(portrait.audio.average).toBeCloseTo(-57.5);
    expect(portrait.audio.classification).toBe('calme');
    expect(portrait.sampleCount).toBe(2);
  });

  it("indique hasData=false et classification=null si aucune donnée n'existe pour le lieu", () => {
    const portrait = buildPortrait({
      location: 'lieu-inconnu',
      windowMinutes: 15,
      windowMeasurementValues: [],
      lastMeasurementAt: null,
      lastObservation: null,
    });
    expect(portrait.hasData).toBe(false);
    expect(portrait.audio.classification).toBeNull();
    expect(portrait.audio.average).toBeNull();
  });

  it("garde hasData=true si seule une observation existe (pas de mesure dans la fenêtre)", () => {
    const portrait = buildPortrait({
      location: 'cafe-plateau',
      windowMinutes: 15,
      windowMeasurementValues: [],
      lastMeasurementAt: null,
      lastObservation: { proximity: 2, vibe: 'calm', timestamp: new Date('2026-01-01T10:00:00Z') },
    });
    expect(portrait.hasData).toBe(true);
    expect(portrait.lastObservation?.vibe).toBe('calm');
  });

  it('reporte fidèlement lastMeasurementAt même sans mesure dans la fenêtre courante', () => {
    const lastMeasurementAt = new Date('2026-01-01T09:30:00Z');
    const portrait = buildPortrait({
      location: 'cafe-plateau',
      windowMinutes: 15,
      windowMeasurementValues: [],
      lastMeasurementAt,
      lastObservation: null,
    });
    expect(portrait.lastMeasurementAt).toBe(lastMeasurementAt);
    expect(portrait.sampleCount).toBe(0);
  });
});
