import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getLocations, subscribeToLocationUpdates } from '../api/locations';
import MapView, { FRESHNESS_THRESHOLD_MINUTES } from '../components/map/MapView';
import AmbianceBadge from '../components/lieu/AmbianceBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

function freshnessLabel(lastMeasurementAt) {
  if (!lastMeasurementAt) return 'Aucune mesure';
  const ageMinutes = Math.round((Date.now() - new Date(lastMeasurementAt).getTime()) / 60000);
  if (ageMinutes < 60) return `Mesuré il y a ${ageMinutes} min`;
  const hours = Math.round(ageMinutes / 60);
  return `Mesuré il y a ${hours} h`;
}

export default function HomePage() {
  const { status, data, error, reload } = useAsync(getLocations, []);

  // Copie locale mutable : le chargement initial vient de useAsync (avec ses
  // états loading/error/empty), mais les mises à jour temps réel (bonus SSE)
  // doivent pouvoir modifier des entrées individuelles sans tout recharger.
  const [locations, setLocations] = useState(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (status === 'success' || status === 'empty') {
      setLocations(data || []);
    }
  }, [status, data]);

  // Bonus temps réel : dès qu'une mesure ou observation arrive côté serveur,
  // le lieu concerné est mis à jour ici sans re-fetch de toute la liste.
  useEffect(() => {
    const unsubscribe = subscribeToLocationUpdates((updated) => {
      setLive(true);
      setLocations((prev) => {
        if (!prev) return prev;
        const exists = prev.some((loc) => loc.slug === updated.slug);
        return exists
          ? prev.map((loc) => (loc.slug === updated.slug ? updated : loc))
          : [...prev, updated];
      });
    });
    return unsubscribe;
  }, []);

  const displayList = locations ?? data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ambiances autour de toi</h1>
          <p>
            Lieux suivis, avec leur classification courante. Un lieu sans mesure depuis plus de{' '}
            {FRESHNESS_THRESHOLD_MINUTES / 60} h est affiché en pointillé.
            {live && <span style={{ color: 'var(--calme)' }}> · Mise à jour en direct active</span>}
          </p>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Chargement des lieux…" />}
      {status === 'error' && <ErrorState error={error} onRetry={reload} />}
      {status === 'empty' && !displayList?.length && (
        <EmptyState
          title="Aucun lieu suivi pour l'instant"
          detail="Les lieux ajoutés par l'équipe apparaîtront ici avec leur ambiance."
        />
      )}

      {(status === 'success' || status === 'empty') && displayList?.length > 0 && (
        <>
          <MapView locations={displayList} />
          <div className="card-grid">
            {displayList.map((loc) => (
              <Link key={loc.slug} to={`/lieux/${loc.slug}`} className="location-card">
                <h3>{loc.name}</h3>
                <AmbianceBadge classification={loc.classification} />
                <span className="freshness">{freshnessLabel(loc.lastMeasurementAt)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
