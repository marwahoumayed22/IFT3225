export default function LoadingState({ label = 'Chargement…' }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="pulse-bars" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
      <p>{label}</p>
    </div>
  );
}
