import { useEffect, useState, useCallback } from 'react';

// Encapsule le pattern chargement / erreur / vide / succès pour n'importe quel
// appel à la couche api/*.js. `isEmpty` détermine ce qui compte comme "vide"
// pour la ressource concernée (ex: liste sans éléments).
export function useAsync(fetchFn, deps = [], { isEmpty } = {}) {
  const [status, setStatus] = useState('loading'); // loading | success | empty | error
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const run = useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    fetchFn()
      .then((result) => {
        if (cancelled) return;
        const payload = result?.data ?? result;
        if (isEmpty ? isEmpty(payload) : Array.isArray(payload) && payload.length === 0) {
          setStatus('empty');
        } else {
          setStatus('success');
        }
        setData(payload);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { status, data, error, reload: run };
}
