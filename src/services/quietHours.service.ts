import { average, classifyAudioLevel } from './aggregation.service';
import { MeasurementLike } from './history.service';

export interface HourlyStat {
  hour: number;
  average: number | null;
  sampleCount: number;
}

// Pure : regroupe des mesures (toutes périodes confondues) par heure locale (0-23)
// et calcule la moyenne par heure. Sert de base à findQuietHours ci-dessous, et pourra
// être réutilisé tel quel par la fonctionnalité "meilleur moment pour étudier" (Tâche 1).
export function computeHourlyStats(measurements: MeasurementLike[]): HourlyStat[] {
  const byHour = new Map<number, number[]>();
  for (const m of measurements) {
    const hour = m.timestamp.getHours();
    if (!byHour.has(hour)) byHour.set(hour, []);
    byHour.get(hour)!.push(m.value);
  }

  return [...byHour.entries()]
    .map(([hour, values]) => ({ hour, average: average(values), sampleCount: values.length }))
    .sort((a, b) => a.hour - b.hour);
}

// Pure : à partir de statistiques horaires déjà calculées, retourne les heures classées "calme".
export function findQuietHours(hourly: HourlyStat[]): number[] {
  return hourly.filter((h) => classifyAudioLevel(h.average) === 'calme').map((h) => h.hour);
}
