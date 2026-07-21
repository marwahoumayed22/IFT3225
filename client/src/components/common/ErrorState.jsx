export default function ErrorState({ error, onRetry }) {
  const message = error?.message || "Une erreur est survenue.";
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">Ça n'a pas fonctionné</p>
      <p className="state__detail">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
