require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../src/models/Device');
const Measurement = require('../src/models/Measurement');
const Observation = require('../src/models/Observation');
const { generateApiKey } = require('../src/utils/apiKey');

const LOCATION = process.env.SEED_LOCATION || 'cafe-exemple';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connecté à MongoDB, nettoyage des données existantes...');

  await Promise.all([Device.deleteMany({}), Measurement.deleteMany({}), Observation.deleteMany({})]);

  const device = await Device.create({
    name: 'Téléphone de démonstration',
    location: LOCATION,
    apiKey: generateApiKey(),
  });
  console.log(`Device créé : ${device._id} (apiKey: ${device.apiKey})`);

  const now = Date.now();
  const measurements = [];
  // Un point toutes les 5 minutes sur 5 heures, avec une "heure de pointe" simulée (11h-14h).
  for (let i = 0; i < 60; i++) {
    const minutesAgo = i * 5;
    const ts = new Date(now - minutesAgo * 60 * 1000);
    const hour = ts.getHours();
    const isBusyHour = hour >= 11 && hour <= 14;
    const value = isBusyHour ? 0.3 + Math.random() * 0.3 : 0.02 + Math.random() * 0.15;

    measurements.push({
      type: 'audio_amplitude',
      value: Number(value.toFixed(3)),
      location: LOCATION,
      timestamp: ts,
      receivedAt: new Date(ts.getTime() + 2000),
      deviceId: device._id,
    });
  }
  await Measurement.insertMany(measurements);
  console.log(`${measurements.length} mesures insérées.`);

  const rawObservations = [
    { proximity: 2, vibe: 'lively', notes: 'Heure de pointe, plusieurs conversations proches' },
    { proximity: 8, vibe: 'calm', notes: "Fin d'après-midi tranquille" },
    { proximity: 5, vibe: 'neutral', notes: 'Quelques clients, musique de fond' },
  ];
  const observations = rawObservations.map((obs, i) => {
    const ts = new Date(now - i * 90 * 60 * 1000);
    return {
      ...obs,
      location: LOCATION,
      timestamp: ts,
      receivedAt: new Date(ts.getTime() + 1000),
      deviceId: device._id,
    };
  });
  await Observation.insertMany(observations);
  console.log(`${observations.length} observations insérées.`);

  console.log('\nSeed terminé. Lieu utilisé :', LOCATION);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
