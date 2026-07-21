export default function EmptyState({ title = 'Rien à afficher pour le moment', detail, action }) {
  return (
    <div className="state state--empty">
      <p className="state__title">{title}</p>
      {detail && <p className="state__detail">{detail}</p>}
      {action}
    </div>
  );
}
