"use client";

export default function Error({ reset }) {
  return (
    <main className="state-page">
      <section className="state-card">
        <h1 className="state-title">잠시 오류가 발생했어요.</h1>
        <button className="retry-button" type="button" onClick={reset}>다시 시도</button>
      </section>
    </main>
  );
}
