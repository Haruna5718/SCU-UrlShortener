import { getStats } from "@/lib/store";
import { hasAdminAuth, unauthorized } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!hasAdminAuth(request)) return unauthorized();
  try {
    return Response.json(await getStats(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "STORAGE_UNAVAILABLE" }, { status: 503 });
  }
}
