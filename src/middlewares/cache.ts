import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cache';

interface CachedResponse {
  status: number;
  body: unknown;
}

// Middleware générique : sert la réponse depuis le cache si présente et fraîche
// (en-tête X-Cache: HIT), sinon laisse la route s'exécuter normalement et met en
// cache le résultat avant de le renvoyer (X-Cache: MISS). Ne met jamais en cache
// les réponses d'erreur (4xx/5xx) : seul le cas nominal est mémorisé, pour éviter
// de figer une erreur transitoire.
export function cacheResponse(keyFn: (req: Request) => string, ttlMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const cached = cache.get<CachedResponse>(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      res.status(cached.status).json(cached.body);
      return;
    }

    res.set('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set<CachedResponse>(key, { status: res.statusCode, body }, ttlMs);
      }
      return originalJson(body);
    }) as Response['json'];

    next();
  };
}
