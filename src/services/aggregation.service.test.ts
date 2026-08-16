import { describe, it, expect } from 'vitest';
import { average, classifyAudioLevel, QUIET_THRESHOLD, LOUD_THRESHOLD } from './aggregation.service';

describe('average', () => {
  it('calcule la moyenne de plusieurs valeurs', () => {
    expect(average([-60, -50, -40])).toBeCloseTo(-50);
  });

  it("retourne null pour un tableau vide (pas de division par zéro)", () => {
    expect(average([])).toBeNull();
  });

  it('retourne null quand aucune donnée n\'est fournie (null/undefined)', () => {
    expect(average(null)).toBeNull();
    expect(average(undefined)).toBeNull();
  });

  it('gère une seule valeur', () => {
    expect(average([-42])).toBe(-42);
  });
});

describe('classifyAudioLevel', () => {
  it('classe "calme" sous le seuil bas', () => {
    expect(classifyAudioLevel(QUIET_THRESHOLD - 1)).toBe('calme');
  });

  it('classe "modere" entre les deux seuils', () => {
    expect(classifyAudioLevel((QUIET_THRESHOLD + LOUD_THRESHOLD) / 2)).toBe('modere');
  });

  it('classe "anime" au-dessus du seuil haut', () => {
    expect(classifyAudioLevel(LOUD_THRESHOLD + 1)).toBe('anime');
  });

  it('classe "inconnu" quand la moyenne est absente', () => {
    expect(classifyAudioLevel(null)).toBe('inconnu');
    expect(classifyAudioLevel(undefined)).toBe('inconnu');
  });

  it('traite les valeurs exactement au seuil comme la catégorie inférieure (limite exclusive)', () => {
    expect(classifyAudioLevel(QUIET_THRESHOLD)).toBe('modere');
    expect(classifyAudioLevel(LOUD_THRESHOLD)).toBe('anime');
  });
});
