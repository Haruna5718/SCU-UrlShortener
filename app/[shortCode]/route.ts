import { findOriginal } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await context.params;
  try {
    const originalUrl = await findOriginal(shortCode);
    if (!originalUrl) return new Response("Not Found", { status: 404 });
    return new Response(null, {
      status: 307,
      headers: { Location: originalUrl, "Cache-Control": "no-store" },
    });
  } catch {
    return new Response("Service Unavailable", { status: 503 });
  }
}
