interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Cache TTL en mémoire du process. Choix assumé pour ce projet : un seul
// dyno/instance Render en production, donc pas besoin d'un cache partagé
// (Redis) pour l'instant. Documenté comme limite/piste d'amélioration dans
// le rapport (Tâche 6) : si l'app scalait à plusieurs instances, ce cache
// deviendrait incohérent entre elles et il faudrait un store partagé.
export class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  // Invalide toutes les entrées dont la clé commence par `prefix`.
  // Utilisé pour effacer d'un coup tout ce qui concerne un lieu donné
  // (portrait, historique, créneaux calmes, etc.) sans connaître chaque clé exacte.
  deleteByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

const ambianceCache = new TTLCache();
export default ambianceCache;
