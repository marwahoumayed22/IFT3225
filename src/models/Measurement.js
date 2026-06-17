const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['audio_amplitude'] },
  value: { type: Number, required: true },
  location: { type: String, required: true, trim: true },
  // Fourni par le client : moment réel de la mesure.
  timestamp: { type: Date, required: true },
  // Fixé par le serveur : moment de réception (utile si la collecte envoie en batch).
  receivedAt: { type: Date, default: Date.now },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
});

measurementSchema.index({ location: 1, timestamp: -1 });

module.exports = mongoose.model('Measurement', measurementSchema);
