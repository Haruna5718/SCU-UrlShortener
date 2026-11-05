import { findUrlByShortCode } from "../../lib/db";
import { recordClick } from "../../lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusPage(status, code, message) {
  return new Response(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${code} · Shortly</title><style>*{box-sizing:border-box}body{min-height:100vh;display:grid;place-items:center;margin:0;padding:24px;background:#faf9fc;color:#20202a;font-family:Arial,"Malgun Gothic",sans-serif}.card{text-align:center}.code{color:#7058e8;font-size:12px;font-weight:700;letter-spacing:1px}h1{margin:10px 0 18px;font-size:20px}a{display:inline-flex;align-items:center;min-height:40px;padding:0 15px;border-radius:9px;background:#7058e8;color:#fff;font-size:12px;font-weight:700;text-decoration:none}</style></head><body><main class="card"><span class="code">${code}</span><h1>${message}</h1><a href="/">홈으로</a></main></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request, { params }) {
  const { shortCode } = await params;

  try {
    const originalUrl = await findUrlByShortCode(shortCode);
    if (!originalUrl) {
      console.warn("Short URL not found", { shortCode });
      return statusPage(404, "404", "링크를 찾을 수 없어요.");
    }

    try {
      await recordClick(shortCode);
    } catch (error) {
      console.error("Failed to record click", { shortCode, error });
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: originalUrl,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to resolve short URL", { shortCode, error });
    return statusPage(503, "503", "잠시 후 다시 시도해 주세요.");
  }
}
