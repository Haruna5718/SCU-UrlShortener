"use client";

import { FormEvent, useState } from "react";

type ShortenedUrl = { shortCode: string; shortUrl: string; originalUrl: string };

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
        setError(code === "MISSING_URL" ? "단축할 URL을 입력해 주세요." :
          code === "SELF_URL" ? "이 서비스의 주소는 단축할 수 없습니다." :
          code === "INVALID_URL" ? "http 또는 https로 시작하는 올바른 URL을 입력해 주세요." :
          "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setResult(data);
      setOriginalUrl(data.originalUrl);
    } catch {
      setError("서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
  }

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="주 메뉴">
        <a className="brand" href="/" aria-label="Shortly 홈">
          <span className="brand-mark" aria-hidden="true">s</span>
          <span>shortly</span>
        </a>
        <span className="topbar-note">링크를 더 간단하게</span>
      </nav>

      <section className="hero" aria-labelledby="title">
        <div className="eyebrow"><span className="status-dot" /> FREE LINK SHORTENER</div>
        <h1 id="title">긴 링크를<br /><span>짧고 간단하게.</span></h1>
        <p className="intro">복잡한 주소를 붙여넣고, 어디서나 공유하기 쉬운 링크로 바꿔보세요.</p>

        <form className="shorten-form" onSubmit={submit}>
          <label className="sr-only" htmlFor="original-url">단축할 URL</label>
          <div className="input-wrap">
            <span className="link-icon" aria-hidden="true">↗</span>
            <input
              id="original-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/your/long/link"
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "만드는 중…" : "짧은 링크 만들기"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="form-hint">URL을 입력하면 6자리 고유 링크가 만들어집니다.</p>
        </form>

        {error && <p className="message error" role="alert">{error}</p>}
        {result && (
          <section className="result-card" aria-label="단축 링크 결과" aria-live="polite">
            <div className="result-label">YOUR SHORT LINK</div>
            <div className="result-row">
              <a href={result.shortUrl}>{result.shortUrl}</a>
              <button className="copy-button" type="button" onClick={copyLink}>
                {copied ? "복사됨 ✓" : "복사 ↗"}
              </button>
            </div>
            <p className="result-original" title={result.originalUrl}>{result.originalUrl}</p>
          </section>
        )}

        <div className="trust-note"><span aria-hidden="true">✳</span> 언제든지 무료로 링크를 단축하세요.</div>
      </section>

      <footer className="footer"><span>SHORTLY</span><span>작은 링크, 큰 가능성.</span></footer>
    </main>
  );
}
