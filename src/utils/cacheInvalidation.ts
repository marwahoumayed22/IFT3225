import ambianceEvents, { AmbianceUpdateEvent } from './events';
import cache from './cache';

// Point d'invalidation du cache : réutilise le même bus d'événements que le flux SSE
// (voir events.ts). Dès qu'une nouvelle mesure ou observation est reçue pour un lieu,
// toutes les entrées de cache concernant CE lieu sont effacées (portrait, historique,
// créneaux calmes, meilleur moment pour étudier, moment le plus bruyant), ainsi que la
// liste globale des lieux (/locations), qui inclut la classification de chaque lieu.
// Importé une seule fois (effet de bord) au démarrage du serveur — voir server.ts.
ambianceEvents.on('update', ({ location }: AmbianceUpdateEvent) => {
  cache.deleteByPrefix(`ambiance:${location}:`);
  cache.delete('locations:list');
});
