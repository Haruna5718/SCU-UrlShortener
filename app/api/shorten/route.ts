import { isOwnServiceUrl, isValidHttpUrl, jsonError } from "@/lib/http";
import { shorten } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_URL", 400);
  }

  const originalValue =
    typeof body === "object" && body !== null
      ? (body as { originalUrl?: unknown }).originalUrl
      : undefined;
  if (typeof originalValue !== "string" || !originalValue.trim()) {
    return jsonError("MISSING_URL", 400);
  }

  const originalUrl = originalValue.trim();
  if (!isValidHttpUrl(originalUrl)) return jsonError("INVALID_URL", 400);
  if (isOwnServiceUrl(originalUrl, request)) return jsonError("SELF_URL", 400);

  try {
    const { shortCode, created } = await shorten(originalUrl);
    const shortUrl = `${new URL(request.url).origin}/${shortCode}`;
    return Response.json(
      { shortCode, shortUrl, originalUrl },
      { status: created ? 201 : 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("STORAGE_UNAVAILABLE", 503);
  }
}
