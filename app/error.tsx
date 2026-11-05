"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="app-error-page">
      <section className="app-error-card">
        <h1>잠시 오류가 발생했어요.</h1>
        <button className="retry-button" type="button" onClick={reset}>다시 시도</button>
      </section>
    </main>
  );
}
