require('dotenv').config();
const readline = require('readline');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.DEVICE_API_KEY;
const LOCATION = process.env.LOCATION || 'cafe-exemple';

if (!API_KEY) {
  console.error('DEVICE_API_KEY doit être défini dans .env');
  process.exit(1);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function main() {
  console.log(`Saisie manuelle d'observation — lieu : ${LOCATION}`);

  const proximityAnswer = await ask(
    'Distance approximative (mètres) à la source de bruit humaine la plus proche : '
  );
  const vibe = await ask('Ambiance générale (calm / neutral / lively / tense) : ');
  const notes = await ask('Notes libres (optionnel) : ');

  rl.close();

  const res = await fetch(`${SERVER_URL}/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      location: LOCATION,
      proximity: Number(proximityAnswer),
      vibe: vibe.trim(),
      notes: notes ? notes.trim() : undefined,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error('Erreur :', res.status, await res.text());
  } else {
    console.log('Observation enregistrée avec succès.');
  }
}

main();
