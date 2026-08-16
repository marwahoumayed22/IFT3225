import { describe, it, expect } from 'vitest';
import { suggestNextQuietWindow } from './studySuggestion.service';

describe('suggestNextQuietWindow', () => {
  it("indique qu'il n'y a pas de suggestion possible sans créneau calme connu", () => {
    const result = suggestNextQuietWindow([], 10);
    expect(result.hasSuggestion).toBe(false);
    expect(result.nextQuietHour).toBeNull();
  });

  it("détecte que l'heure actuelle est déjà calme (hoursUntil = 0)", () => {
    const result = suggestNextQuietWindow([8, 9], 8);
    expect(result.hasSuggestion).toBe(true);
    expect(result.hoursUntil).toBe(0);
    expect(result.nextQuietHour).toBe(8);
  });

  it('trouve le prochain créneau calme plus tard dans la journée', () => {
    const result = suggestNextQuietWindow([14], 8);
    expect(result.hoursUntil).toBe(6);
    expect(result.nextQuietHour).toBe(14);
  });

  it('gère le passage à minuit (créneau calme le lendemain matin)', () => {
    const result = suggestNextQuietWindow([2], 22);
    expect(result.hoursUntil).toBe(4); // 22 -> 23 -> 0 -> 1 -> 2
    expect(result.nextQuietHour).toBe(2);
  });

  it('compte correctement la durée du créneau calme consécutif', () => {
    const result = suggestNextQuietWindow([6, 7, 8, 15], 5);
    expect(result.nextQuietHour).toBe(6);
    expect(result.hoursUntil).toBe(1);
    expect(result.consecutiveQuietHours).toBe(3); // 6, 7, 8
  });
});
