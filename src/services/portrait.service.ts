import { average, classifyAudioLevel, Classification, QUIET_THRESHOLD, LOUD_THRESHOLD } from './aggregation.service';

export interface Portrait {
  location: string;
  hasData: boolean;
  windowMinutes: number;
  sampleCount: number;
  audio: {
    average: number | null;
    classification: Classification | null;
    scale: { unit: string; quietBelow: number; loudAbove: number };
  };
  lastObservation: { proximity: number; vibe: string; timestamp: Date } | null;
  lastMeasurementAt: Date | null;
  generatedAt: Date;
}

export interface PortraitInput {
  location: string;
  windowMinutes: number;
  windowMeasurementValues: number[];
  lastMeasurementAt: Date | null;
  lastObservation: { proximity: number; vibe: string; timestamp: Date } | null;
  now?: Date;
}

// Pure : ne touche pas la base de données. La récupération des données (mesures de la
// fenêtre, dernière mesure, dernière observation) reste dans utils/portrait.ts, qui
// interroge Mongoose puis délègue le calcul ici. C'est ce qui rend cette fonction
// testable sans serveur ni base de données.
export function buildPortrait(input: PortraitInput): Portrait {
  const { location, windowMinutes, windowMeasurementValues, lastMeasurementAt, lastObservation } = input;
  const now = input.now ?? new Date();

  const avg = average(windowMeasurementValues);
  const hasAnyData = Boolean(lastMeasurementAt || lastObservation);

  return {
    location,
    hasData: hasAnyData,
    windowMinutes,
    sampleCount: windowMeasurementValues.length,
    audio: {
      average: avg,
      classification: hasAnyData ? classifyAudioLevel(avg) : null,
      scale: { unit: 'amplitude_phyphox', quietBelow: QUIET_THRESHOLD, loudAbove: LOUD_THRESHOLD },
    },
    lastObservation,
    lastMeasurementAt,
    generatedAt: now,
  };
}
