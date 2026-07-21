import { apiClient } from './client';

export function getPortrait(slug) {
  return apiClient.get(`/ambiance/${slug}`);
}

export function getHistory(slug, last = '3h') {
  return apiClient.get(`/ambiance/${slug}/history?last=${encodeURIComponent(last)}`);
}

export function getQuietHours(slug) {
  return apiClient.get(`/ambiance/${slug}/quiet-hours`);
}
