// Couche client : SEUL point d'entrée pour parler à l'API.
// Aucun composant ne doit appeler fetch()/axios directement — tout passe par ici
// et par les modules api/*.js qui l'utilisent.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getApiBaseUrl() {
  return BASE_URL;
}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Cache TTL en mémoire, côté client — même principe que le cache backend
// (utils/cache.ts) : une Map avec expiration, invalidable par préfixe. Vidé
// automatiquement au rechargement de la page (mémoire du process JS), ce qui est
// voulu : pas besoin de persister ce cache, il ne fait qu'éviter des requêtes
// redondantes pendant une session de navigation.
const responseCache = new Map();

function getCached(path) {
  const entry = responseCache.get(path);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(path);
    return undefined;
  }
  return entry.value;
}

function setCached(path, value, ttlMs) {
  responseCache.set(path, { value, expiresAt: Date.now() + ttlMs });
}

// Invalide toutes les entrées dont la clé (le path) commence par `prefix`.
// Appelé après une écriture (ex: soumission d'une observation) pour que la donnée
// affichée reflète immédiatement le changement plutôt que d'attendre l'expiration du TTL.
function invalidateCache(prefix) {
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }
}

async function request(path, { method = 'GET', body, auth = false, ttlMs } = {}) {
  // Seules les requêtes GET explicitement marquées d'un ttlMs passent par le cache.
  // Par défaut (ttlMs absent), rien n'est mis en cache — c'est le cas de toutes les
  // routes /users/me* (données propres à l'usager) et /auth/* (sensibles), pour
  // lesquelles on veut toujours la donnée la plus fraîche.
  if (method === 'GET' && ttlMs) {
    const cached = getCached(path);
    if (cached !== undefined) return cached;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Erreur réseau (API injoignable) — distincte d'une erreur HTTP.
    throw new ApiError(0, 'NETWORK_ERROR', "Impossible de joindre le serveur. Vérifie que l'API tourne.");
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    // Réponse sans corps JSON (rare, ex: 204)
  }

  if (!res.ok) {
    const err = payload && payload.error;
    throw new ApiError(res.status, err?.code || 'UNKNOWN_ERROR', err?.message || `Erreur ${res.status}`, err?.details);
  }

  // On ne cache jamais une erreur : seule une réponse 2xx est mémorisée.
  if (method === 'GET' && ttlMs) {
    setCached(path, payload, ttlMs);
  }

  return payload;
}

export const apiClient = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
  invalidate: (prefix) => invalidateCache(prefix),
};

export { ApiError };
