import { apiClient } from './client';

// TTL alignés sur le cache backend (voir src/routes/ambiance.routes.ts) : la donnée
// n'a de toute façon pas changé plus vite côté serveur, inutile de re-fetch plus souvent.
export function getPortrait(slug) {
  return apiClient.get(`/ambiance/${slug}`, { ttlMs: 15_000 });
}

export function getHistory(slug, last = '3h') {
  return apiClient.get(`/ambiance/${slug}/history?last=${encodeURIComponent(last)}`, { ttlMs: 30_000 });
}

export function getQuietHours(slug) {
  return apiClient.get(`/ambiance/${slug}/quiet-hours`, { ttlMs: 300_000 });
}

export function getBestStudyTime(slug) {
  return apiClient.get(`/ambiance/${slug}/best-study-time`, { ttlMs: 120_000 });
}
