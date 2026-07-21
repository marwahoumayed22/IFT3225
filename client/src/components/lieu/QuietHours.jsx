export default function QuietHours({ quietHours, hourly }) {
  const measuredHours = new Set(hourly.map((h) => h.hour));

  return (
    <div>
      <div className="quiet-hours-grid">
        {Array.from({ length: 24 }, (_, hour) => {
          const isQuiet = quietHours.includes(hour);
          const hasData = measuredHours.has(hour);
          return (
            <div
              key={hour}
              className={`hour-cell ${isQuiet ? 'hour-cell--quiet' : 'hour-cell--other'}`}
              title={hasData ? `${hour}h — ${isQuiet ? 'calme' : 'moins calme'}` : `${hour}h — aucune donnée`}
              style={{ opacity: hasData ? 1 : 0.35 }}
            >
              {hour}
            </div>
          );
        })}
      </div>
      <div className="legend">
        <span><span className="legend-dot" style={{ background: 'rgba(94,200,216,0.6)' }} />Créneau typiquement calme</span>
        <span><span className="legend-dot" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }} />Autre / sans donnée</span>
      </div>
    </div>
  );
}
