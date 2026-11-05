import { getStats } from "@/lib/store";
import { hasAdminAuth, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(content: string, status = 200) {
  return new Response(`<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#faf9fc">
  <title>Shortly · 통계</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#faf9fc;color:#252433;font-family:Inter,"Malgun Gothic",sans-serif}
    a{color:inherit;text-decoration:none}.top{height:68px;max-width:880px;margin:auto;padding:0 22px;display:flex;align-items:center;justify-content:space-between}
    .brand{display:flex;align-items:center;gap:9px;font-size:18px;font-weight:800;letter-spacing:-1px}.mark{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:#7058e8;color:white;font-size:17px}
    .home{width:36px;height:36px;display:grid;place-items:center;border:1px solid #e9e7ef;border-radius:10px;background:white;color:#777383;font-size:17px}
    main{width:min(620px,calc(100% - 36px));margin:60px auto}.heading{margin-bottom:18px}
    h1{margin:0;font-size:22px;letter-spacing:-.8px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}.card{min-height:148px;padding:18px;border:1px solid #e9e7ef;border-radius:14px;background:#fff;box-shadow:0 9px 25px rgba(43,34,84,.035)}
    .icon{width:34px;height:34px;display:grid;place-items:center;margin-bottom:20px;border-radius:10px;background:#f1eeff;color:#7058e8;font-size:17px}
    .label{display:block;margin-bottom:5px;color:#92909f;font-size:11px}.value{font-size:28px;font-weight:750;letter-spacing:-1px;font-variant-numeric:tabular-nums}
    .error{margin:0;padding:18px;border:1px solid #f0d8dc;border-radius:12px;background:#fff;color:#bc4c5b;font-size:13px}
    @media(max-width:480px){main{margin:40px auto}.grid{gap:9px}.card{min-height:132px;padding:14px}.value{font-size:24px}}
  </style>
</head>
<body>
  <header class="top"><a class="brand" href="/"><span class="mark">s</span>shortly</a><a class="home" href="/" aria-label="홈으로">⌂</a></header>
  <main>${content}</main>
</body>
</html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: Request) {
  if (!hasAdminAuth(request)) return unauthorized();
  try {
    const stats = await getStats();
    const urls = Math.max(0, Math.floor(Number(stats.totalUrls) || 0)).toLocaleString("ko-KR");
    const clicks = Math.max(0, Math.floor(Number(stats.totalClicks) || 0)).toLocaleString("ko-KR");
    return page(`<div class="heading"><h1>통계</h1></div>
      <section class="grid" aria-label="서비스 통계">
        <article class="card"><span class="icon" aria-hidden="true">↗</span><span class="label">단축 링크</span><strong class="value">${urls}</strong></article>
        <article class="card"><span class="icon" aria-hidden="true">⌁</span><span class="label">총 클릭</span><strong class="value">${clicks}</strong></article>
      </section>`);
  } catch {
    return page(`<p class="error" role="alert">통계를 불러오지 못했어요.</p>`, 503);
  }
}
