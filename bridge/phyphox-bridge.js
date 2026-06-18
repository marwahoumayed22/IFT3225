require('dotenv').config();

const PHYPHOX_URL = process.env.PHYPHOX_URL; // ex: http://192.168.1.42:8080/get?amplitude=full
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.DEVICE_API_KEY;
const LOCATION = process.env.LOCATION || 'cafe-exemple';
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS) || 5000;

if (!PHYPHOX_URL || !API_KEY) {
  console.error('PHYPHOX_URL et DEVICE_API_KEY doivent être définis dans .env');
  process.exit(1);
}

async function pollAndForward() {
  try {
    const phyphoxRes = await fetch(PHYPHOX_URL);
    const data = await phyphoxRes.json();

    // Le nom du canal ("amplitude" ici) dépend de la configuration de l'expérience
    // Phyphox utilisée (à activer dans "Allow remote access" > export du buffer).
    const buffer = data.buffer.dB.buffer;
    if (!buffer || buffer.length === 0) return;

    const latestValue = buffer[buffer.length - 1];

    const res = await fetch(`${SERVER_URL}/measurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify({
        type: 'audio_amplitude',
        value: latestValue,
        location: LOCATION,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.error('Erreur lors de l\'envoi au serveur :', res.status, await res.text());
    } else {
      console.log(`Mesure envoyée : ${latestValue}`);
    }
  } catch (err) {
    console.error('Erreur du bridge :', err.message);
  }
}

console.log(`Bridge démarré, interrogation toutes les ${POLL_INTERVAL_MS}ms vers ${SERVER_URL}`);
setInterval(pollAndForward, POLL_INTERVAL_MS);
pollAndForward();
