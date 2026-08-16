import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTLCache } from './cache';

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retourne la valeur stockée tant que le TTL n\'est pas expiré', () => {
    const cache = new TTLCache();
    cache.set('a', { hello: 'world' }, 1000);
    expect(cache.get('a')).toEqual({ hello: 'world' });
  });

  it('retourne undefined pour une clé absente', () => {
    const cache = new TTLCache();
    expect(cache.get('inconnue')).toBeUndefined();
  });

  it('expire une entrée après son TTL', () => {
    const cache = new TTLCache();
    cache.set('a', 42, 1000);
    vi.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeUndefined();
  });

  it('invalide toutes les clés partageant un préfixe donné', () => {
    const cache = new TTLCache();
    cache.set('ambiance:cafe-plateau:portrait', 1, 60000);
    cache.set('ambiance:cafe-plateau:history', 2, 60000);
    cache.set('ambiance:autre-cafe:portrait', 3, 60000);

    cache.deleteByPrefix('ambiance:cafe-plateau:');

    expect(cache.get('ambiance:cafe-plateau:portrait')).toBeUndefined();
    expect(cache.get('ambiance:cafe-plateau:history')).toBeUndefined();
    expect(cache.get('ambiance:autre-cafe:portrait')).toBe(3);
  });

  it('clear() vide entièrement le cache', () => {
    const cache = new TTLCache();
    cache.set('a', 1, 60000);
    cache.set('b', 2, 60000);
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
