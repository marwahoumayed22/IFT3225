import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Seuil de fraîcheur : au-delà de 2h sans mesure, on considère qu'un lieu
// n'a plus de donnée "récente" et on l'affiche en grisé/pointillé sur la carte.
// Choisi car nos collectes visent un point toutes les 5-15 minutes ; 2h laisse
// une marge confortable pour une panne ponctuelle du device sans pour autant
// afficher une ambiance obsolète comme si elle était actuelle. Voir le rapport.
export const FRESHNESS_THRESHOLD_MINUTES = 120;

const COLORS = {
  calme: '#5ec8d8',
  modere: '#e8a94b',
  anime: '#e85d4e',
};

function isFresh(lastMeasurementAt) {
  if (!lastMeasurementAt) return false;
  const ageMinutes = (Date.now() - new Date(lastMeasurementAt).getTime()) / 60000;
  return ageMinutes <= FRESHNESS_THRESHOLD_MINUTES;
}

function markerIcon(location) {
  const fresh = isFresh(location.lastMeasurementAt);
  const color = location.classification && COLORS[location.classification] ? COLORS[location.classification] : '#5d6b72';

  return divIcon({
    className: '',
    html: `<div class="marker-pin ${fresh ? '' : 'marker-pin--stale'}" style="background:${color}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });
}

const LABELS = { calme: 'Calme', modere: 'Modéré', anime: 'Animé' };

// Ajuste automatiquement le centre/zoom de la carte pour englober tous les lieux
// (corrige aussi un bug d'affichage Leaflet où le zoom initial est mal calculé
// si la taille du conteneur n'est pas encore stable au premier rendu).
function FitToLocations({ locations }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15);
    } else if (locations.length > 1) {
      const bounds = locations.map((loc) => [loc.lat, loc.lng]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, locations]);

  return null;
}

export default function MapView({ locations }) {
  // Centre par défaut : Montréal, si aucun lieu (ne devrait pas arriver ici,
  // le cas vide est géré par la page appelante).
  const center = locations.length
    ? [locations[0].lat, locations[0].lng]
    : [45.5019, -73.5674];

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToLocations locations={locations} />
        {locations.map((loc) => (
          <Marker key={loc.slug} position={[loc.lat, loc.lng]} icon={markerIcon(loc)}>
            <Popup>
              <div className="map-popup">
                <h3>{loc.name}</h3>
                <p style={{ margin: '0 0 8px', fontSize: '0.82rem', color: '#93a1a8' }}>
                  {loc.classification ? LABELS[loc.classification] : 'Pas de donnée récente'}
                  {!isFresh(loc.lastMeasurementAt) && loc.lastMeasurementAt && ' (obsolète)'}
                </p>
                <Link to={`/lieux/${loc.slug}`}>Voir le portrait →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
