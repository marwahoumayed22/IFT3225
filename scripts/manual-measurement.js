// Alternative au bridge Phyphox quand le téléphone et l'ordinateur ne peuvent
// pas se joindre en réseau (ex: Wi-Fi public avec isolation client, comme dans
// un café). Tu lis la valeur affichée sur l'écran Phyphox et tu la tapes ici.
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

async function sendOne(value) {
  const res = await fetch(`${SERVER_URL}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({
      type: 'audio_amplitude',
      value,
      location: LOCATION,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error('  Erreur :', res.status, await res.text());
  } else {
    console.log(`  Mesure envoyée (${value}) pour ${LOCATION}`);
  }
}

async function main() {
  console.log(`Saisie manuelle de mesures — lieu : ${LOCATION}`);
  console.log('Tape la valeur affichée sur Phyphox, puis Entrée. Tape "q" pour arrêter.\n');

  while (true) {
    const answer = await ask('Valeur (dB affiché sur Phyphox) : ');
    if (answer.trim().toLowerCase() === 'q') break;

    const value = Number(answer.trim());
    if (Number.isNaN(value)) {
      console.log('  Valeur invalide, réessaie.');
      continue;
    }

    await sendOne(value);
  }

  rl.close();
  console.log('\nTerminé.');
}

main();
