"use client";

import { FormEvent, useState } from "react";

type ShortenedUrl = { shortCode: string; shortUrl: string; originalUrl: string };

function LinkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5a4.5 4.5 0 0 0 6.36 0l3-3A4.5 4.5 0 0 0 13 4.14l-1.72 1.72M14 10.5a4.5 4.5 0 0 0-6.36 0l-3 3A4.5 4.5 0 0 0 11 19.86l1.72-1.72" /></svg>;
}

function CopyIcon({ done }: { done: boolean }) {
  return done
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></svg>;
}

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        const code = data?.error?.code;
        setError(code === "SELF_URL" ? "내 단축 주소는 사용할 수 없어요." :
          code === "INVALID_URL" ? "URL 형식을 확인해 주세요." :
          "링크를 만들지 못했어요. 다시 시도해 주세요.");
        return;
      }
      setResult(data);
      setOriginalUrl(data.originalUrl);
    } catch {
      setError("연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
    } catch {
      setError("링크를 선택해 복사해 주세요.");
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Shortly 홈">
          <span className="brand-mark"><LinkIcon /></span>
          <span>shortly</span>
        </a>
      </header>

      <section className="hero" aria-labelledby="title">
        <h1 id="title">링크 단축</h1>
        <form className="shorten-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="original-url">원본 URL</label>
          <div className="input-wrap">
            <span className="input-icon"><LinkIcon /></span>
            <input
              id="original-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/long-link"
              value={originalUrl}
              onChange={(event) => {
                setOriginalUrl(event.target.value);
                setError("");
                setResult(null);
                setCopied(false);
              }}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "url-error" : undefined}
            />
            <button type="submit" disabled={loading || !originalUrl.trim()} aria-label={loading ? "단축 중" : "링크 단축"}>
              {loading ? <span className="button-spinner" aria-hidden="true" /> : <><span>단축</span><span aria-hidden="true">↗</span></>}
            </button>
          </div>
          {error && <p className="message error" id="url-error" role="alert"><span aria-hidden="true">!</span>{error}</p>}
        </form>

        {result && (
          <section className="result-card" aria-label="단축 링크 결과" aria-live="polite">
            <span className="result-check" aria-hidden="true">✓</span>
            <div className="result-content">
              <span className="result-label">단축 링크</span>
              <a className="result-link" href={result.shortUrl}>{result.shortUrl}</a>
              <span className="result-original" title={result.originalUrl}>{result.originalUrl}</span>
            </div>
            <button className={`copy-button${copied ? " is-copied" : ""}`} type="button" onClick={copyLink} title={copied ? "복사 완료" : "링크 복사"} aria-label={copied ? "복사 완료" : "링크 복사"}>
              <CopyIcon done={copied} />
            </button>
            <span className="sr-only" role="status">{copied ? "링크를 복사했어요." : ""}</span>
          </section>
        )}
      </section>
    </main>
  );
}
