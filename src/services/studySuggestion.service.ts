export interface StudySuggestion {
  hasSuggestion: boolean;
  nextQuietHour: number | null;
  hoursUntil: number | null;
  consecutiveQuietHours: number;
  message: string;
}

const NO_SUGGESTION: StudySuggestion = {
  hasSuggestion: false,
  nextQuietHour: null,
  hoursUntil: null,
  consecutiveQuietHours: 0,
  message: "Pas assez de données pour suggérer un créneau calme pour l'instant.",
};

// Pure : à partir des heures déjà identifiées comme "calme" (voir quietHours.service.ts)
// et de l'heure courante, trouve le prochain créneau calme (éventuellement l'heure
// actuelle elle-même) et estime sa durée en comptant les heures calmes consécutives.
// Raisonne en heures cycliques (0-23), sans tenir compte du jour de la semaine — c'est
// une limite assumée et documentée dans le rapport (piste d'amélioration : distinguer
// semaine/weekend une fois plus de données collectées).
export function suggestNextQuietWindow(quietHours: number[], currentHour: number): StudySuggestion {
  if (quietHours.length === 0) {
    return NO_SUGGESTION;
  }

  const quietSet = new Set(quietHours);

  let hoursUntil = 0;
  let hour = ((currentHour % 24) + 24) % 24;
  while (!quietSet.has(hour) && hoursUntil < 24) {
    hour = (hour + 1) % 24;
    hoursUntil += 1;
  }

  if (hoursUntil >= 24) {
    // Ne devrait pas arriver puisque quietHours n'est pas vide, mais on reste défensif.
    return NO_SUGGESTION;
  }

  let consecutiveQuietHours = 0;
  let probe = hour;
  while (quietSet.has(probe) && consecutiveQuietHours < 24) {
    consecutiveQuietHours += 1;
    probe = (probe + 1) % 24;
  }

  const message =
    hoursUntil === 0
      ? `C'est calme maintenant — bon moment pour étudier (encore environ ${consecutiveQuietHours}h).`
      : `Prochain créneau calme dans ${hoursUntil}h (vers ${hour}h), pour environ ${consecutiveQuietHours}h.`;

  return { hasSuggestion: true, nextQuietHour: hour, hoursUntil, consecutiveQuietHours, message };
}
