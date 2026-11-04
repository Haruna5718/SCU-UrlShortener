import { getStats } from "@/lib/store";
import { hasAdminAuth, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAdminAuth(request)) return unauthorized();
  try {
    const stats = await getStats();
    return new Response(`<!doctype html><html lang="ko"><meta charset="utf-8"><title>Shortly Admin</title><body><h1>Shortly 관리자</h1><pre>${JSON.stringify(stats, null, 2)}</pre></body></html>`, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Storage unavailable", { status: 503 });
  }
}
