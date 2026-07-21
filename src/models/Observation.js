const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  // Distance approximative en mètres à la source de bruit humaine la plus proche.
  proximity: { type: Number, required: true },
  vibe: { type: String, required: true, enum: ['calm', 'neutral', 'lively', 'tense'] },
  notes: { type: String, trim: true },
  timestamp: { type: Date, required: true },
  receivedAt: { type: Date, default: Date.now },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  // Phase 2 : usager qui a soumis l'observation via l'app cliente.
  // Optionnel pour ne pas casser les observations existantes / la collecte Phase 1.
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

observationSchema.index({ location: 1, timestamp: -1 });

module.exports = mongoose.model('Observation', observationSchema);
