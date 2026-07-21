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
npm run dev
```

`npm run dev` lance le serveur directement depuis les sources TypeScript (`src/`), avec rechargement automatique. Pour une exécution en production (compilée) :

```bash
npm run build   # compile src/*.ts vers dist/*.js
npm start        # lance dist/server.js
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

---

## Phase 2 — mise à jour de l'infrastructure

La Phase 2 ajoute une app cliente React (dossier [`client/`](./client)) qui consomme cette API. Trois changements ont été apportés au modèle et aux endpoints, **sans casser** la collecte ni les lectures de la Phase 1 :

1. **Coordonnées des lieux** — nouveau modèle `Location` (`slug`, `name`, `lat`, `lng`). Le `slug` réutilise exactement la même chaîne que le champ `location` déjà présent sur `Device` / `Measurement` / `Observation` : aucune donnée existante n'a été renommée.
2. **Auteur des observations** — `Observation` porte maintenant un `authorId` (référence `User`), **optionnel** par défaut pour ne pas invalider les observations déjà en base.
3. **Classification exposée** — le portrait d'ambiance (`GET /ambiance/:location`) et la liste des lieux (`GET /locations`) renvoient directement `classification` (`calme` / `modere` / `anime`) et l'échelle utilisée, pour que le client n'ait rien à recalculer.

### Nouveaux endpoints

| Méthode | Endpoint | Auth | Corps | Réponse |
|---|---|---|---|---|
| POST | `/auth/register` | non | `{ email, password, name }` | `201` + `{ token, user }` |
| POST | `/auth/login` | non | `{ email, password }` | `200` + `{ token, user }` |
| GET | `/locations` | non | — | lieux avec coordonnées + classification courante |
| GET | `/locations/:slug` | non | — | détail d'un lieu |
| POST | `/locations` | JWT | `{ slug, name, lat, lng }` | `201` + lieu créé |
| GET | `/users/me` | JWT | — | profil de l'usager connecté |
| GET | `/users/me/observations` | JWT | — | récapitulatif des contributions |
| GET | `/users/me/locations` | JWT | — | lieux où l'usager a soumis des observations |
| POST | `/users/me/favorites/:slug` | JWT | — | ajoute un favori |
| DELETE | `/users/me/favorites/:slug` | JWT | — | retire un favori |

### Endpoint modifié

- `POST /observations` — protégé par **JWT** (usager de l'app) au lieu de `x-api-key` (device). C'est un changement de comportement assumé : en Phase 1, une observation venait d'un device de collecte ; en Phase 2, elle vient d'un usager identifié qui doit être crédité de sa contribution. `GET /observations` reste public et inchangé.

### Variables d'environnement ajoutées

```
JWT_SECRET=...
JWT_EXPIRES_IN=7d
```

### Peupler les lieux et les mesures de la Phase 2

```bash
npm run seed:phase2
```

Insère (ou met à jour) les 3 lieux avec coordonnées et génère 15 mesures par lieu (45 au total, ≥ 12 requis) sans effacer les données existantes.

---

## Bonus réalisés

### Backend en TypeScript

Tout le serveur (`src/`) a été porté en TypeScript : modèles Mongoose typés (interfaces `Document`), middlewares et routes typés via `express.Router`, requête/réponse typées. Le contrat entre le modèle de données, les routes et les réponses HTTP est vérifié à la compilation (`npm run build` ou `npx tsc --noEmit`).

- `npm run dev` : exécution directe des sources `.ts` avec rechargement automatique (`ts-node-dev`).
- `npm run build` puis `npm start` : compilation vers `dist/` puis exécution du JavaScript compilé (mode "production").
- Les scripts indépendants du serveur (`seed/`, `bridge/`, `scripts/`) restent en JavaScript simple ; `seed/seed-phase2.js` consomme les modèles compilés dans `dist/` (d'où l'exécution automatique de `npm run build` avant le seed, voir le script `seed:phase2`).

### Temps réel (Server-Sent Events)

`GET /locations/stream` ouvre un flux SSE : dès qu'une mesure (`POST /measurements`) ou une observation (`POST /observations`) est reçue pour un lieu, sa classification mise à jour est poussée immédiatement à tous les clients connectés à ce flux, sans qu'ils aient à re-interroger l'API par sondage périodique. Le client React s'y abonne dès le chargement de la carte (`src/api/locations.js` → `subscribeToLocationUpdates`) et met à jour l'affichage en direct.

