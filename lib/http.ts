import { timingSafeEqual } from "node:crypto";

export function jsonError(code: string, status: number) {
  return Response.json({ error: { code, message: code } }, { status });
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function hostname(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isOwnServiceUrl(value: string, request: Request) {
  const input = hostname(value);
  if (!input) return false;

  const headers = request.headers;
  const requestHosts = [
    headers.get("x-forwarded-host"),
    headers.get("host"),
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].flatMap((entry) => (entry ?? "").split(","));
  const ownHosts = new Set(requestHosts.map((entry) => hostname(entry.trim())).filter(Boolean));
  return ownHosts.has(input);
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hasAdminAuth(request: Request) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return false;

  const header = request.headers.get("authorization") ?? "";
  const match = /^Basic\s+(.+)$/i.exec(header);
  if (!match) return false;

  let credentials: string;
  try {
    credentials = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }
  const separator = credentials.indexOf(":");
  if (separator < 0) return false;
  return safeEqual(credentials.slice(0, separator), username) &&
    safeEqual(credentials.slice(separator + 1), password);
}

export function unauthorized() {
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin", charset="UTF-8"' },
  });
}
