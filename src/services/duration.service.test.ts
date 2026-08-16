import { describe, it, expect } from 'vitest';
import { parseDuration } from './duration.service';

describe('parseDuration', () => {
  it('convertit les heures en minutes', () => {
    expect(parseDuration('3h', 999)).toBe(180);
  });

  it('lit directement les minutes', () => {
    expect(parseDuration('45m', 999)).toBe(45);
  });

  it('retombe sur la valeur par défaut si la chaîne est absente', () => {
    expect(parseDuration(undefined, 180)).toBe(180);
  });

  it('retombe sur la valeur par défaut pour un format invalide', () => {
    expect(parseDuration('bientôt', 180)).toBe(180);
    expect(parseDuration('3', 180)).toBe(180);
    expect(parseDuration('3j', 180)).toBe(180);
  });

  it("retombe sur la valeur par défaut si l'entrée n'est pas une chaîne", () => {
    expect(parseDuration(42, 180)).toBe(180);
    expect(parseDuration(null, 180)).toBe(180);
  });
});
