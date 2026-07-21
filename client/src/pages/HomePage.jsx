import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getLocations } from '../api/locations';
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ambiances autour de toi</h1>
          <p>
            Lieux suivis, avec leur classification courante. Un lieu sans mesure depuis plus de{' '}
            {FRESHNESS_THRESHOLD_MINUTES / 60} h est affiché en pointillé.
          </p>
        </div>
      </div>

      {status === 'loading' && <LoadingState label="Chargement des lieux…" />}
      {status === 'error' && <ErrorState error={error} onRetry={reload} />}
      {status === 'empty' && (
        <EmptyState
          title="Aucun lieu suivi pour l'instant"
          detail="Les lieux ajoutés par l'équipe apparaîtront ici avec leur ambiance."
        />
      )}

      {status === 'success' && (
        <>
          <MapView locations={data} />
          <div className="card-grid">
            {data.map((loc) => (
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
