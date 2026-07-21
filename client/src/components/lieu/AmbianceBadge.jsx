const LABELS = {
  calme: 'Calme',
  modere: 'Modéré',
  anime: 'Animé',
};

export default function AmbianceBadge({ classification }) {
  const known = classification && LABELS[classification];
  const variant = known ? classification : 'inconnu';
  const label = known ? LABELS[classification] : 'Pas de donnée récente';

  return (
    <span className={`badge badge--${variant}`}>
      <span className="badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
