"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
// Émetteur partagé : chaque nouvelle mesure ou observation émet un événement
// 'update' avec le slug du lieu concerné. Les clients SSE connectés à
// GET /locations/stream écoutent cet émetteur pour pousser les mises à jour
// d'ambiance sans que le client React ait à re-interroger l'API en boucle.
class AmbianceEvents extends events_1.EventEmitter {
}
const ambianceEvents = new AmbianceEvents();
ambianceEvents.setMaxListeners(0);
exports.default = ambianceEvents;
