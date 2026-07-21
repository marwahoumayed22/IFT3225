import { apiClient } from './client';

export function getLocations() {
  return apiClient.get('/locations');
}

export function getLocation(slug) {
  return apiClient.get(`/locations/${slug}`);
}
