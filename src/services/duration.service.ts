// "3h", "45m", "24h" -> nombre de minutes. Retombe sur fallbackMinutes si invalide/absent.
// Pure : aucune dépendance externe, facilement testable avec des cas limites (chaîne vide,
// format invalide, unité manquante, valeur négative implicite via regex qui la rejette).
export function parseDuration(str: unknown, fallbackMinutes: number): number {
  if (typeof str !== 'string') return fallbackMinutes;
  const match = /^(\d+)(m|h)$/.exec(str);
  if (!match) return fallbackMinutes;
  const value = Number(match[1]);
  return match[2] === 'h' ? value * 60 : value;
}
