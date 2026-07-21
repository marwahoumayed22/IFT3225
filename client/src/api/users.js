import { apiClient } from './client';

export function getMe() {
  return apiClient.get('/users/me', { auth: true });
}

export function getMyObservations() {
  return apiClient.get('/users/me/observations', { auth: true });
}

export function getMyLocations() {
  return apiClient.get('/users/me/locations', { auth: true });
}

export function addFavorite(slug) {
  return apiClient.post(`/users/me/favorites/${slug}`, undefined, { auth: true });
}

export function removeFavorite(slug) {
  return apiClient.delete(`/users/me/favorites/${slug}`, { auth: true });
}
