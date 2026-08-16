// Fonctionnalité additionnelle (Tâche 1) : suggère le prochain créneau typiquement
// calme du lieu, pour aider à décider "j'y vais maintenant ou j'attends un peu ?".
export default function StudyTimeSuggestion({ suggestion }) {
  if (!suggestion.hasSuggestion) {
    return (
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        Pas encore assez de données historiques pour suggérer un créneau calme.
      </p>
    );
  }

  const isNow = suggestion.hoursUntil === 0;

  return (
    <div
      className="panel"
      style={{
        background: 'var(--surface-raised)',
        border: `1px solid ${isNow ? 'var(--calme)' : 'var(--border)'}`,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.3rem' }} aria-hidden="true">
          {isNow ? '📖' : '⏳'}
        </span>
        <p style={{ margin: 0, fontSize: '0.95rem' }}>{suggestion.message}</p>
      </div>
    </div>
  );
}
