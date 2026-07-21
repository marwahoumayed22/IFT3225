import { apiClient, getApiBaseUrl } from './client';

export function getLocations() {
  return apiClient.get('/locations');
}

export function getLocation(slug) {
  return apiClient.get(`/locations/${slug}`);
}

// Bonus temps réel : abonnement au flux SSE /locations/stream.
// onUpdate reçoit un lieu mis à jour à chaque nouvelle mesure/observation.
// Retourne une fonction de désabonnement à appeler au démontage du composant.
export function subscribeToLocationUpdates(onUpdate) {
  const source = new EventSource(`${getApiBaseUrl()}/locations/stream`);
  source.onmessage = (event) => {
    try {
      onUpdate(JSON.parse(event.data));
    } catch {
      // message non-JSON (commentaire de heartbeat) : rien à faire
    }
  };
  return () => source.close();
}
