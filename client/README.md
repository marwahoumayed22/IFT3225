# Ambiance — client (Phase 2)

Application React qui consomme l'API Ambiance : une carte des lieux suivis avec leur classification d'ambiance (calme / modéré / animé), un portrait détaillé par lieu (historique, créneaux calmes), et un espace compte pour soumettre des observations. Projet réalisé dans le cadre du cours IFT3225 (Phase 2).

## Prérequis

- Node.js ≥ 18
- L'API de la Phase 1/2 (dossier [`../`](../)) démarrée et accessible (voir son propre README)

## Installation et lancement

```bash
npm install
cp .env.example .env
npm run dev
```

L'app démarre sur `http://localhost:5173` (port par défaut de Vite).

## Configuration

Une seule variable, dans `.env` :

```
VITE_API_URL=http://localhost:3000
```

C'est l'URL de base de l'API. Toute la communication réseau passe par `src/api/client.js`, qui lit cette variable — aucun composant n'appelle `fetch` directement.

## Se connecter et tester les actions protégées

1. Lancer l'API (`npm start` dans le dossier parent) et vous assurer qu'il y a au moins un lieu en base (`npm run seed:phase2` côté API).
2. Depuis l'app, cliquer sur **Créer un compte** (`/inscription`), remplir email / mot de passe (≥ 6 caractères) / nom.
3. Une fois connecté, le token JWT est conservé dans le `localStorage` du navigateur (clé `ambiance_auth`) et ré-injecté automatiquement dans l'en-tête `Authorization` de chaque appel protégé.
4. Aller sur le portrait d'un lieu (`/lieux/:slug`, accessible depuis la carte) : le formulaire **Soumettre une observation** n'apparaît que si vous êtes connecté·e (sinon, un bouton invite à se connecter).
5. L'espace **Mon compte** (`/compte`) est une route protégée : si vous n'êtes pas connecté·e, vous êtes redirigé·e vers `/connexion`.
6. Se déconnecter efface le token du `localStorage` et masque à nouveau les actions protégées.

Les lectures (carte, portrait, historique, créneaux calmes) restent accessibles sans compte.

## Structure

```
src/
  api/          couche client — seul point d'appel vers l'API
  auth/         AuthContext (état connecté/déconnecté) + garde de route
  components/   badge, carte Leaflet, graphe (Recharts), formulaire, états communs
  hooks/        useAsync — pattern chargement/erreur/vide/succès réutilisable
  pages/        une page par route
```
