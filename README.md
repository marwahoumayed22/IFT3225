# Ambiance API

Infrastructure qui capte l'ambiance d'un café en quasi temps réel (niveau sonore via Phyphox + observations environnementales saisies manuellement) et la rend interrogeable par HTTP. Projet réalisé dans le cadre du cours IFT3225 (Phase 1).

## Prérequis

- Node.js ≥ 18
- Un cluster MongoDB Atlas (ou MongoDB local)
- L'application Phyphox (Android/iOS) avec l'option "Allow remote access" activée dans l'expérience choisie

## Installation et lancement

```bash
npm install
cp .env.example .env
# remplir MONGODB_URI dans .env (et les autres variables selon les scripts utilisés)
npm start
```

Le serveur démarre sur `http://localhost:3000` (port configurable via `PORT`).

Pour peupler la base avec des données de démonstration (sans faire de vraie collecte) :

```bash
npm run seed
```

Pour démarrer le bridge qui relaie les données Phyphox vers le serveur :

```bash
npm run bridge
```

Pour saisir manuellement une observation environnementale (fallback) :

```bash
npm run observe
```

## Table des endpoints

| Méthode | Endpoint | Auth | Corps | Réponse |
|---|---|---|---|---|
| POST | `/devices` | non | `{ name, location }` | `201` + `{ id, name, location, apiKey }` |
| GET | `/devices` | non | — | `200` + liste (sans `apiKey`) |
| POST | `/measurements` | `x-api-key` | `{ type, value, location, timestamp }` | `201` + document créé |
| GET | `/measurements` | non | filtres `?location=&type=&from=&to=` | `200` + liste |
| POST | `/observations` | `x-api-key` | `{ location, proximity, vibe, notes, timestamp }` | `201` + document créé |
| GET | `/observations` | non | filtres `?location=&from=&to=` | `200` + liste |
| GET | `/ambiance/:location` | non | — | portrait actuel (fenêtre 15 min) |
| GET | `/ambiance/:location/history?last=3h` | non | — | évolution par tranches de 15 min |
| GET | `/ambiance/:location/quiet-hours` | non | — | créneaux typiquement calmes |
| GET | `/ambiance/:location/loudest-moment?last=24h` | non | — | pic de bruit sur la période |

Toutes les réponses suivent l'enveloppe `{ "data": ... }` en cas de succès, `{ "error": { "code", "message" } }` en cas d'erreur.

## Tests (Postman)

1. `POST /devices` avec `{ "name": "Mon téléphone", "location": "cafe-exemple" }` → récupérer `apiKey` dans la réponse.
2. `POST /measurements` avec l'en-tête `x-api-key` rempli avec cette clé.
3. `GET /ambiance/cafe-exemple` pour vérifier le portrait agrégé.
4. Tester aussi sans clé (`401`) et avec une clé invalide (`403`) sur les routes protégées.

## Fichier `.env.example`

Voir `.env.example` à la racine pour la liste complète des variables d'environnement attendues par chaque script (`server.js`, `seed.js`, `bridge`, `manual-observation.js`).
