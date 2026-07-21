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

async function request(path, { method = 'GET', body, auth = false } = {}) {
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

  return payload;
}

export const apiClient = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};

export { ApiError };
