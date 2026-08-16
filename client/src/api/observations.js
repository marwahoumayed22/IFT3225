import { apiClient } from './client';

export function submitObservation({ location, proximity, vibe, notes, timestamp }) {
  return apiClient
    .post('/observations', { location, proximity, vibe, notes, timestamp }, { auth: true })
    .then((result) => {
      // Écriture : invalide tout ce qui a été mis en cache pour ce lieu (portrait,
      // historique, créneaux calmes...) et la liste des lieux, dont la classification
      // vient potentiellement de changer. Sans ça, portrait.reload() dans LocationPage
      // re-servirait la version en cache au lieu d'aller chercher la donnée fraîche.
      apiClient.invalidate(`/ambiance/${location}`);
      apiClient.invalidate('/locations');
      return result;
    });
}
