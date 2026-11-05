"use client";

import { useCallback, useEffect, useState } from "react";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("ko-KR") : "-";
}

function StatCard({ title, value, detail }) {
  return (
    <article className="stat-card">
      <span className="stat-card-title">{title}</span>
      <strong className="stat-card-value">{value}</strong>
      {detail && <span className="stat-card-detail">{detail}</span>}
    </article>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/stats", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "통계를 불러오지 못했어요.");
      setStats(data);
    } catch {
      setError("통계를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (loading && !stats) {
    return <main className="admin-page"><div className="loading-spinner" aria-label="불러오는 중" /></main>;
  }

  if (error && !stats) {
    return (
      <main className="admin-page">
        <div className="admin-header"><h1 className="admin-title">통계</h1></div>
        <p className="admin-state admin-error" role="alert">{error}</p>
        <button className="admin-button" type="button" onClick={loadStats}>다시 시도</button>
      </main>
    );
  }

  const { summary, urls } = stats;
  const topUrl = summary.topUrl;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <h1 className="admin-title">통계</h1>
        <div className="admin-actions">
          <button className="admin-button" type="button" onClick={loadStats} disabled={loading} aria-label="새로고침" title="새로고침">↻</button>
          <a className="admin-home" href="/" aria-label="홈으로" title="홈">⌂</a>
        </div>
      </header>

      {error && <p className="admin-state admin-error" role="alert">새로고침 실패</p>}

      <section className="stats-grid" aria-label="전체 통계">
        <StatCard title="단축 링크" value={summary.totalUrls.toLocaleString("ko-KR")} />
        <StatCard title="총 클릭" value={summary.totalClicks.toLocaleString("ko-KR")} />
        <StatCard title="클릭된 링크" value={summary.clickedUrls.toLocaleString("ko-KR")} />
        <StatCard title="최다 클릭" value={topUrl ? `/${topUrl.shortCode}` : "-"} detail={topUrl ? `${topUrl.clickCount.toLocaleString("ko-KR")}회` : undefined} />
      </section>

      <section aria-labelledby="urls-title">
        <h2 className="admin-section-title" id="urls-title">URL별 사용량</h2>
        <div className="table-wrap">
          <table className="stats-table">
            <thead><tr><th>코드</th><th>원본 URL</th><th>클릭</th><th>생성</th><th>최근 클릭</th></tr></thead>
            <tbody>
              {urls.length === 0 ? (
                <tr><td className="admin-state" colSpan={5}>저장된 URL이 없습니다.</td></tr>
              ) : urls.map((url) => (
                <tr key={url.shortCode}>
                  <td>{url.shortCode}</td>
                  <td><a href={url.originalUrl} target="_blank" rel="noreferrer" title={url.originalUrl}>{url.originalUrl}</a></td>
                  <td>{url.clickCount.toLocaleString("ko-KR")}</td>
                  <td>{formatDate(url.createdAt)}</td>
                  <td>{formatDate(url.lastClickedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
