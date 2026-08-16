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
| GET | `/ambiance/:location/best-study-time` | non | — | prochain créneau calme (Phase 3) |
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

---

## Phase 3 — robustesse, tests, cache et déploiement

### Fonctionnalité additionnelle : meilleur moment pour étudier

`GET /ambiance/:location/best-study-time` suggère le prochain créneau typiquement calme d'un lieu ("c'est calme maintenant, pour ~2h" / "prochain créneau calme dans 3h"), à partir de l'historique déjà utilisé par `/quiet-hours`. Affiché sur la page d'un lieu (`StudyTimeSuggestion.jsx`). Limite assumée : raisonne en heures cycliques, sans distinguer semaine/weekend (piste d'amélioration une fois plus de données collectées).

### Maintenabilité : couche `services/`

Toute la logique métier auparavant mêlée aux routes (bucketing d'historique, calcul de créneaux calmes, portrait d'ambiance, moment le plus bruyant) a été extraite en fonctions **pures** dans `src/services/` — aucune ne touche MongoDB. Les routes ne font plus que : récupérer les données, appeler le service, répondre. C'est ce qui rend les services testables sans serveur ni base de données (voir Tests ci-dessous).

### Tests unitaires

```bash
npm test
```

7 fichiers de tests, 42 cas, couvrant `aggregation`, `duration`, `history`, `quietHours`, `loudestMoment`, `portrait`, `studySuggestion` et le cache (`TTLCache`) — au moins 3 cas (nominal + limites) par service.

### Stratégie de cache

**Backend** (`src/utils/cache.ts`, `src/middlewares/cache.ts`) : cache TTL en mémoire, clé = route + paramètres, appliqué aux routes `GET` de lecture d'ambiance (`/ambiance/:location*`, TTL 15 s à 5 min selon la volatilité de la donnée) et à `GET /locations` (TTL 20 s, la plus coûteuse à calculer). Invalidation ciblée dès qu'une mesure/observation arrive, via le même bus d'événements que le SSE (`src/utils/cacheInvalidation.ts`).

**Frontend** (`client/src/api/client.js`) : même principe, TTL alignés sur le backend, invalidés après soumission d'une observation.

**Jamais mis en cache** : toute écriture (POST/DELETE), `/locations/stream` (SSE), et surtout `/users/me*` (données propres à l'usager — cachées par URL, elles fuiteraient entre usagers).

### Optimisations et faiblesses

**Cache** : les routes de lecture d'ambiance (`/ambiance/:location*`) et `/locations` passent
par un cache TTL en mémoire, servi via l'en-tête `X-Cache: HIT`/`MISS`. Ça évite de recalculer
le portrait/l'historique à chaque requête tant que la donnée n'a pas changé, avec invalidation
ciblée dès qu'une mesure/observation arrive — pas de données périmées servies.

**Extraction en services purs** : la logique métier a été sortie des routes vers
`src/services/`, sous forme de fonctions pures sans accès direct à MongoDB, ce qui les rend
testables isolément (42 cas de tests, 7 fichiers) sans serveur ni base de données.

**Faiblesses assumées** : le `TTLCache` vit en mémoire dans le process Node, donc adapté à une
seule instance (plan Render gratuit) mais deviendrait incohérent si l'app scalait à plusieurs
instances (piste : cache partagé type Redis). `best-study-time` raisonne en heures cycliques
sans distinguer semaine/weekend (piste : bucketiser une fois plus de données collectées). Les
tests couvrent la couche service mais pas les routes HTTP elles-mêmes (piste : tests
d'intégration sur `/auth` et `/observations`). Le frontend reste sur des hooks/`Context` sans
state manager centralisé (Zustand/Redux), suffisant à cette échelle mais limitant si l'état
partagé se complexifie.

### Déploiement (Render)

Le dépôt inclut un blueprint [`render.yaml`](./render.yaml) décrivant les deux services :

- **`ambiance-api`** — Web Service Node, `npm install && npm run build` puis `npm start`.
- **`ambiance-client`** — Static Site, build dans `client/`, publié sur `client/dist`.

**Adresses en production :**

- Backend : `<À COMPLÉTER après déploiement>`
- Frontend : `<À COMPLÉTER après déploiement>`

**Étapes pour déployer (à faire une fois, depuis le tableau de bord Render) :**

1. Sur [dashboard.render.com](https://dashboard.render.com), **New → Blueprint**, connecter ce dépôt GitHub. Render détecte `render.yaml` et propose de créer les deux services.
2. Sur `ambiance-api`, dans l'onglet *Environment*, définir les variables marquées `sync: false` dans `render.yaml` : `MONGODB_URI` (chaîne de connexion Atlas), `JWT_SECRET` (chaîne aléatoire longue). Laisser `CORS_ORIGIN` vide pour l'instant.
3. Déployer `ambiance-api`, noter son URL (ex: `https://ambiance-api.onrender.com`).
4. Sur `ambiance-client`, définir `VITE_API_URL` avec cette URL, puis déployer. Noter son URL (ex: `https://ambiance-client.onrender.com`).
5. Revenir sur `ambiance-api`, définir `CORS_ORIGIN` avec l'URL du frontend obtenue à l'étape 4, puis redéployer (pour que le CORS n'accepte que ce domaine).
6. Mettre à jour ce README avec les deux adresses définitives.

Les deux services sont automatiquement servis en HTTPS par Render (aucune configuration additionnelle requise).


