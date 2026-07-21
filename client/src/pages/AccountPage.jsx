import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { getMyObservations, getMyLocations, addFavorite, removeFavorite } from '../api/users';
import { getLocations } from '../api/locations';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const VIBE_LABELS = { calm: 'Calme', neutral: 'Neutre', lively: 'Animée', tense: 'Tendue' };

export default function AccountPage() {
  const { user, logout } = useAuth();
  const observations = useAsync(getMyObservations, [], { isEmpty: (d) => d.length === 0 });
  const myLocations = useAsync(getMyLocations, [], { isEmpty: (d) => d.length === 0 });
  const allLocations = useAsync(getLocations, [], { isEmpty: (d) => d.length === 0 });
  const [favorites, setFavorites] = useState(user?.favoriteLocations || []);
  const [favBusy, setFavBusy] = useState(null);

  async function toggleFavorite(slug) {
    setFavBusy(slug);
    try {
      if (favorites.includes(slug)) {
        await removeFavorite(slug);
        setFavorites((prev) => prev.filter((s) => s !== slug));
      } else {
        await addFavorite(slug);
        setFavorites((prev) => [...prev, slug]);
      }
    } catch {
      // silencieux : l'utilisateur peut réessayer, l'état visuel reste inchangé
    } finally {
      setFavBusy(null);
    }
  }

  return (
    <div className="account-grid">
      <div className="panel">
        <div className="profile-row">
          <div>
            <h2>{user?.name}</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', margin: '4px 0 0' }}>{user?.email}</p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={logout}>Se déconnecter</button>
        </div>
      </div>

      <div className="panel">
        <h2>Mes favoris</h2>
        {allLocations.status === 'loading' && <LoadingState label="Chargement des lieux…" />}
        {allLocations.status === 'error' && <ErrorState error={allLocations.error} onRetry={allLocations.reload} />}
        {(allLocations.status === 'success' || allLocations.status === 'empty') && (
          <div>
            {allLocations.data?.length ? (
              allLocations.data.map((loc) => (
                <span key={loc.slug} className="fav-chip">
                  {loc.name}
                  <button
                    type="button"
                    disabled={favBusy === loc.slug}
                    onClick={() => toggleFavorite(loc.slug)}
                    aria-label={favorites.includes(loc.slug) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {favorites.includes(loc.slug) ? '★' : '☆'}
                  </button>
                </span>
              ))
            ) : (
              <EmptyState title="Aucun lieu à mettre en favori pour l'instant" />
            )}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Lieux où j'ai fait des écoutes</h2>
        {myLocations.status === 'loading' && <LoadingState label="Chargement…" />}
        {myLocations.status === 'error' && <ErrorState error={myLocations.error} onRetry={myLocations.reload} />}
        {myLocations.status === 'empty' && (
          <EmptyState title="Tu n'as pas encore observé de lieu" detail="Soumets une observation depuis le portrait d'un lieu pour qu'il apparaisse ici." />
        )}
        {myLocations.status === 'success' && (
          <div className="card-grid">
            {myLocations.data.map((loc) => (
              <Link key={loc.slug} to={`/lieux/${loc.slug}`} className="location-card">
                <h3>{loc.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>Mes contributions</h2>
        {observations.status === 'loading' && <LoadingState label="Chargement de tes observations…" />}
        {observations.status === 'error' && <ErrorState error={observations.error} onRetry={observations.reload} />}
        {observations.status === 'empty' && (
          <EmptyState title="Aucune observation envoyée pour l'instant" detail="Tes contributions apparaîtront ici une fois soumises." />
        )}
        {observations.status === 'success' && (
          <ul className="contrib-list">
            {observations.data.map((obs) => (
              <li key={obs._id} className="contrib-item">
                <span>
                  <strong>{obs.location}</strong>
                  <div className="vibe">{VIBE_LABELS[obs.vibe] || obs.vibe} · {obs.proximity} m</div>
                </span>
                <span style={{ color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                  {new Date(obs.timestamp).toLocaleString('fr-CA')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
