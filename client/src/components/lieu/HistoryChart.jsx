import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CLASSIFICATION_COLOR = {
  calme: '#5ec8d8',
  modere: '#e8a94b',
  anime: '#e85d4e',
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryChart({ history, windowLabel }) {
  const points = history
    .filter((bucket) => bucket.average !== null && bucket.average !== undefined)
    .map((bucket) => ({
      time: formatTime(bucket.from),
      average: bucket.average,
      classification: bucket.classification,
    }));

  if (points.length === 0) {
    return <p className="state__detail">Pas assez de mesures pour tracer l'historique sur cette période.</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="ambianceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c9eff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7c9eff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2a333a" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" stroke="#5d6b72" fontSize={11} tickLine={false} axisLine={{ stroke: '#2a333a' }} />
          <YAxis stroke="#5d6b72" fontSize={11} tickLine={false} axisLine={false} width={44} />
          <Tooltip
            contentStyle={{ background: '#1e262b', border: '1px solid #2a333a', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#93a1a8' }}
            formatter={(value, name, props) => [
              `${value.toFixed(3)} (${props.payload.classification || '—'})`,
              'Amplitude moyenne',
            ]}
          />
          <Area type="monotone" dataKey="average" stroke="#7c9eff" strokeWidth={2} fill="url(#ambianceFill)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="legend">
        <span><span className="legend-dot" style={{ background: CLASSIFICATION_COLOR.calme }} />Calme</span>
        <span><span className="legend-dot" style={{ background: CLASSIFICATION_COLOR.modere }} />Modéré</span>
        <span><span className="legend-dot" style={{ background: CLASSIFICATION_COLOR.anime }} />Animé</span>
        {windowLabel && <span style={{ marginLeft: 'auto' }}>Fenêtre : {windowLabel}</span>}
      </div>
    </div>
  );
}
