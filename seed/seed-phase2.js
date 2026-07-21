// Seed Phase 2 : insère les 3 lieux (avec coordonnées GPS) et génère au moins
// 12 nouvelles mesures réparties sur ces 3 lieux (exigence de la Tâche 1).
// N'efface RIEN de l'existant (contrairement à seed/seed.js de la Phase 1) :
// on veut accumuler des données réalistes, pas repartir de zéro.
//
// Usage : npm run seed:phase2
require('dotenv').config();
const mongoose = require('mongoose');
// Le backend est maintenant en TypeScript (voir tsconfig.json) : ce script,
// lui, reste en JS simple et consomme donc la version compilée (dist/),
// d'où la nécessité de lancer `npm run build` avant `npm run seed:phase2`.
const Device = require('../dist/models/Device').default;
const Measurement = require('../dist/models/Measurement').default;
const Location = require('../dist/models/Location').default;
const { generateApiKey } = require('../dist/utils/apiKey');

const LOCATIONS = [
  { slug: 'second-cup-cote-des-neiges', name: 'Second Cup Côte-des-Neiges', lat: 45.4976, lng: -73.6217, profile: 'moyen' },
  { slug: 'biblio-udem', name: 'Bibliothèque des sciences UdeM', lat: 45.5048, lng: -73.6142, profile: 'calme' },
  { slug: 'cafe-plateau', name: 'Café Dépanneur Peluso Plateau', lat: 45.5245, lng: -73.5816, profile: 'anime' },
];

// Génère une valeur d'amplitude plausible selon le profil sonore du lieu.
function amplitudeFor(profile) {
  if (profile === 'calme') return Number((0.01 + Math.random() * 0.1).toFixed(3)); // < QUIET_THRESHOLD
  if (profile === 'anime') return Number((0.35 + Math.random() * 0.3).toFixed(3)); // > LOUD_THRESHOLD
  return Number((0.15 + Math.random() * 0.15).toFixed(3)); // entre les deux -> "modere"
}

async function upsertLocation(loc) {
  const existing = await Location.findOneAndUpdate(
    { slug: loc.slug },
    { $set: { name: loc.name, lat: loc.lat, lng: loc.lng } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Lieu prêt : ${existing.slug} (${existing.lat}, ${existing.lng})`);
  return existing;
}

async function ensureDeviceFor(slug) {
  let device = await Device.findOne({ location: slug, name: `Collecte Phase 2 — ${slug}` });
  if (!device) {
    device = await Device.create({
      name: `Collecte Phase 2 — ${slug}`,
      location: slug,
      apiKey: generateApiKey(),
    });
    console.log(`  Device créé pour ${slug} (apiKey: ${device.apiKey})`);
  }
  return device;
}

async function seedMeasurementsFor(loc, device, count = 15) {
  const now = Date.now();
  const measurements = [];
  for (let i = 0; i < count; i++) {
    const minutesAgo = i * 12; // étalées dans le temps pour peupler l'historique
    const ts = new Date(now - minutesAgo * 60 * 1000);
    measurements.push({
      type: 'audio_amplitude',
      value: amplitudeFor(loc.profile),
      location: loc.slug,
      timestamp: ts,
      receivedAt: new Date(ts.getTime() + 1500),
      deviceId: device._id,
    });
  }
  await Measurement.insertMany(measurements);
  console.log(`  ${measurements.length} mesures insérées pour ${loc.slug}`);
  return measurements.length;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connecté à MongoDB.\n');

  let total = 0;
  for (const loc of LOCATIONS) {
    const location = await upsertLocation(loc);
    const device = await ensureDeviceFor(location.slug);
    total += await seedMeasurementsFor(location, device);
  }

  console.log(`\nTerminé : ${total} mesures au total sur ${LOCATIONS.length} lieux (exigence : ≥ 12 sur 3 lieux).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
