import { apiClient } from './client';

export function submitObservation({ location, proximity, vibe, notes, timestamp }) {
  return apiClient.post(
    '/observations',
    { location, proximity, vibe, notes, timestamp },
    { auth: true }
  );
}
