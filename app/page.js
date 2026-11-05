"use client";

import { useState } from "react";
import { validateUrl } from "../lib/url-validation";

function LinkMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13.5a4.5 4.5 0 0 0 6.36 0l3-3A4.5 4.5 0 0 0 13 4.14l-1.72 1.72M14 10.5a4.5 4.5 0 0 0-6.36 0l-3 3A4.5 4.5 0 0 0 11 19.86l1.72-1.72" />
    </svg>
  );
}

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);

    const validationError = validateUrl(originalUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: originalUrl.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message ?? "요청을 처리하지 못했어요.");
        return;
      }

      setResult(data);
      setOriginalUrl(data.originalUrl);
    } catch {
      setError("연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyShortUrl() {
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
      <a className="brand" href="/" aria-label="Shortly 홈">
        <span className="brand-mark"><LinkMark /></span>
        <span>shortly</span>
      </a>

      <section className="url-card" aria-labelledby="page-title">
        <h1 id="page-title">URL Shortener</h1>
        <form className="url-form" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor="original-url">URL</label>
          <div className="input-row">
            <span className="input-icon"><LinkMark /></span>
            <input
              id="original-url"
              name="originalUrl"
              type="text"
              inputMode="url"
              placeholder="https://example.com/long-link"
              value={originalUrl}
              onChange={(event) => {
                setOriginalUrl(event.target.value);
                setError("");
                setResult(null);
                setCopied(false);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "url-error" : undefined}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !originalUrl.trim()}>
              {isLoading ? <span className="spinner" aria-label="단축 중" /> : <>단축 <span aria-hidden="true">↗</span></>}
            </button>
          </div>

          {error && <p id="url-error" className="message message-error" role="alert">{error}</p>}
        </form>

        {result && (
          <section className="result-card" aria-label="단축 결과" aria-live="polite">
            <span className="result-check" aria-hidden="true">✓</span>
            <div className="result-copy">
              <span className="result-label">단축 링크</span>
              <a className="result-link" href={result.shortUrl}>{result.shortUrl}</a>
              <span className="result-original" title={result.originalUrl}>{result.originalUrl}</span>
            </div>
            <button className={`copy-button${copied ? " copied" : ""}`} type="button" onClick={copyShortUrl} aria-label={copied ? "복사 완료" : "링크 복사"} title={copied ? "복사 완료" : "링크 복사"}>
              {copied ? "✓" : "▢"}
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
