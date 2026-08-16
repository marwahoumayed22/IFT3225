import { useParams, Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getLocation } from '../api/locations';
import { getPortrait, getHistory, getQuietHours, getBestStudyTime } from '../api/ambiance';
import { useAuth } from '../auth/AuthContext';
import AmbianceBadge from '../components/lieu/AmbianceBadge';
import HistoryChart from '../components/lieu/HistoryChart';
import QuietHours from '../components/lieu/QuietHours';
import StudyTimeSuggestion from '../components/lieu/StudyTimeSuggestion';
import ObservationForm from '../components/observations/ObservationForm';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export default function LocationPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const locationInfo = useAsync(() => getLocation(slug), [slug]);
  const portrait = useAsync(() => getPortrait(slug), [slug], { isEmpty: () => false });
  const history = useAsync(() => getHistory(slug, '3h'), [slug], { isEmpty: (d) => d.length === 0 });
  const quietHours = useAsync(() => getQuietHours(slug), [slug], { isEmpty: () => false });
  const studyTime = useAsync(() => getBestStudyTime(slug), [slug], { isEmpty: () => false });

  if (locationInfo.status === 'loading') return <LoadingState label="Chargement du lieu…" />;
  if (locationInfo.status === 'error') {
    return <ErrorState error={locationInfo.error} onRetry={locationInfo.reload} />;
  }

  const location = locationInfo.data;

  return (
    <div>
      <Link to="/" style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}>
        ← Retour à la carte
      </Link>

      <div className="detail-header">
        <h1>{location.name}</h1>
        {portrait.status === 'success' && <AmbianceBadge classification={portrait.data.audio?.classification} />}
        {portrait.status === 'error' && portrait.error?.code === 'NO_DATA' && <AmbianceBadge classification={null} />}
      </div>

      <div className="panel">
        <h2>Portrait courant</h2>
        {portrait.status === 'loading' && <LoadingState label="Calcul du portrait…" />}
        {portrait.status === 'error' && portrait.error?.code !== 'NO_DATA' && (
          <ErrorState error={portrait.error} onRetry={portrait.reload} />
        )}
        {(portrait.status === 'success' || (portrait.status === 'error' && portrait.error?.code === 'NO_DATA')) && (
          portrait.status === 'success' ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Basé sur {portrait.data.sampleCount} mesure(s) des {portrait.data.windowMinutes} dernières minutes.
              {portrait.data.lastObservation && (
                <> Dernière observation humaine : « {portrait.data.lastObservation.vibe} ».</>
              )}
            </p>
          ) : (
            <EmptyState title="Pas encore de mesure pour ce lieu" detail="Reviens plus tard, ou sois la première personne à observer ce lieu." />
          )
        )}
      </div>

      <div className="panel">
        <h2>Historique (3 dernières heures)</h2>
        {history.status === 'loading' && <LoadingState label="Chargement de l'historique…" />}
        {history.status === 'error' && <ErrorState error={history.error} onRetry={history.reload} />}
        {history.status === 'empty' && <EmptyState title="Pas de mesure sur cette période" />}
        {history.status === 'success' && <HistoryChart history={history.data} windowLabel="3h" />}
      </div>

      <div className="panel">
        <h2>Créneaux calmes</h2>
        {quietHours.status === 'loading' && <LoadingState label="Analyse des créneaux…" />}
        {quietHours.status === 'error' && quietHours.error?.code !== 'NO_DATA' && (
          <ErrorState error={quietHours.error} onRetry={quietHours.reload} />
        )}
        {quietHours.status === 'error' && quietHours.error?.code === 'NO_DATA' && (
          <EmptyState title="Pas assez de mesures pour dégager des créneaux calmes" />
        )}
        {quietHours.status === 'success' && (
          <QuietHours quietHours={quietHours.data.quietHours} hourly={quietHours.data.hourly} />
        )}
      </div>

      <div className="panel">
        <h2>Meilleur moment pour étudier</h2>
        {studyTime.status === 'loading' && <LoadingState label="Recherche du prochain créneau calme…" />}
        {studyTime.status === 'error' && studyTime.error?.code !== 'NO_DATA' && (
          <ErrorState error={studyTime.error} onRetry={studyTime.reload} />
        )}
        {studyTime.status === 'error' && studyTime.error?.code === 'NO_DATA' && (
          <EmptyState title="Pas assez de mesures pour ce lieu" detail="Reviens plus tard, une fois que des données auront été collectées." />
        )}
        {studyTime.status === 'success' && <StudyTimeSuggestion suggestion={studyTime.data} />}
      </div>

      <div className="panel">
        <h2>Soumettre une observation</h2>
        {isAuthenticated ? (
          <ObservationForm locationSlug={slug} onSubmitted={() => { portrait.reload(); history.reload(); }} />
        ) : (
          <EmptyState
            title="Connexion requise"
            detail="Connecte-toi pour soumettre une observation sur ce lieu."
            action={<Link to="/connexion" className="btn">Se connecter</Link>}
          />
        )}
      </div>
    </div>
  );
}
