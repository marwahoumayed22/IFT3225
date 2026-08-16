import { average, classifyAudioLevel, Classification } from './aggregation.service';

export interface MeasurementLike {
  value: number;
  timestamp: Date;
}

export interface HistoryBucket {
  from: Date;
  to: Date;
  average: number | null;
  classification: Classification;
  sampleCount: number;
}

// Pure : reçoit des mesures déjà filtrées par période (le filtrage par date reste
// à la charge de l'appelant, qui interroge la base — voir routes/ambiance.routes.ts).
// Découpe en tranches de `bucketMinutes` et calcule moyenne + classification par tranche.
export function bucketMeasurements(measurements: MeasurementLike[], bucketMinutes: number): HistoryBucket[] {
  const bucketMs = bucketMinutes * 60 * 1000;
  const buckets = new Map<number, number[]>();

  for (const m of measurements) {
    const bucketStart = Math.floor(m.timestamp.getTime() / bucketMs) * bucketMs;
    if (!buckets.has(bucketStart)) buckets.set(bucketStart, []);
    buckets.get(bucketStart)!.push(m.value);
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, values]) => {
      const avg = average(values);
      return {
        from: new Date(start),
        to: new Date(start + bucketMs),
        average: avg,
        classification: classifyAudioLevel(avg),
        sampleCount: values.length,
      };
    });
}
