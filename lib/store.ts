import { createHash, randomInt } from "node:crypto";

type MemoryStore = {
  byUrl: Map<string, string>;
  byCode: Map<string, string>;
  clicks: number;
};

const shared = globalThis as typeof globalThis & { __urlShortenerStore?: MemoryStore };
const memory = (shared.__urlShortenerStore ??= {
  byUrl: new Map(),
  byCode: new Map(),
  clicks: 0,
});

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const urlKey = (originalUrl: string) =>
  `url:${createHash("sha256").update(originalUrl).digest("hex")}`;
const codeKey = (shortCode: string) => `code:${shortCode}`;

function newCode() {
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url && !token && process.env.VERCEL !== "1") return null;
  if (!url || !token) throw new Error("Redis REST URL and token must both be configured");
  return { url: url.replace(/\/$/, ""), token };
}

async function redis<T>(...command: string[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Redis is not configured");

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const payload = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || payload.error) throw new Error("Redis request failed");
  return payload.result as T;
}

const createScript = [
  "local existing = redis.call('GET', KEYS[1])",
  "if existing then return 'EXISTING:' .. existing end",
  "if redis.call('EXISTS', KEYS[2]) == 1 then return 'COLLISION' end",
  "redis.call('SET', KEYS[2], ARGV[1])",
  "redis.call('SET', KEYS[1], ARGV[2])",
  "redis.call('INCR', 'total:urls')",
  "return 'CREATED:' .. ARGV[1]",
].join("\n");

export async function shorten(originalUrl: string) {
  if (!redisConfig()) {
    const existing = memory.byUrl.get(originalUrl);
    if (existing) return { shortCode: existing, created: false };

    let shortCode = newCode();
    while (memory.byCode.has(shortCode)) shortCode = newCode();
    memory.byUrl.set(originalUrl, shortCode);
    memory.byCode.set(shortCode, originalUrl);
    return { shortCode, created: true };
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = newCode();
    const result = await redis<string>(
      "EVAL",
      createScript,
      "2",
      urlKey(originalUrl),
      codeKey(candidate),
      candidate,
      originalUrl,
    );
    if (result.startsWith("EXISTING:")) {
      return { shortCode: result.slice("EXISTING:".length), created: false };
    }
    if (result.startsWith("CREATED:")) {
      return { shortCode: result.slice("CREATED:".length), created: true };
    }
  }

  throw new Error("Could not allocate a short code");
}

export async function findOriginal(shortCode: string) {
  if (!redisConfig()) {
    const originalUrl = memory.byCode.get(shortCode) ?? null;
    if (originalUrl) memory.clicks += 1;
    return originalUrl;
  }

  const originalUrl = await redis<string | null>("GET", codeKey(shortCode));
  if (originalUrl) await redis<number>("INCR", "total:clicks");
  return originalUrl;
}

export async function getStats() {
  if (!redisConfig()) {
    return { totalUrls: memory.byUrl.size, totalClicks: memory.clicks };
  }

  const [urls, clicks] = await Promise.all([
    redis<string | null>("GET", "total:urls"),
    redis<string | null>("GET", "total:clicks"),
  ]);
  return { totalUrls: Number(urls ?? 0), totalClicks: Number(clicks ?? 0) };
}
