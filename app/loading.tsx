export default function Loading() {
  return (
    <main className="loading-page" aria-label="불러오는 중">
      <div className="loading-card" aria-hidden="true">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-form" />
      </div>
    </main>
  );
}
