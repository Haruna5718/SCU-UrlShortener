import { neon } from "@neondatabase/serverless";

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const stateKey = "__iscuUrlShortenerStore";

export function getLocalState() {
  const root = globalThis;
  if (!root[stateKey]) {
    root[stateKey] = { byCode: new Map(), byOriginalUrl: new Map() };
  }
  return root[stateKey];
}

export function getDatabase() {
  if (sql) return sql;
  if (process.env.VERCEL === "1") {
    throw new Error("DATABASE_URL must be configured on Vercel.");
  }
  return null;
}

export async function findShortCodeByOriginalUrl(originalUrl) {
  const database = getDatabase();
  if (!database) return getLocalState().byOriginalUrl.get(originalUrl) ?? null;

  const rows = await database`
    SELECT short_code
    FROM urls
    WHERE original_url = ${originalUrl}
    ORDER BY created_at ASC
    LIMIT 1
  `;
  return rows[0]?.short_code ?? null;
}

export async function saveUrl(shortCode, originalUrl) {
  const database = getDatabase();
  if (!database) {
    const existing = getLocalState().byOriginalUrl.get(originalUrl);
    if (existing) return existing;
    if (getLocalState().byCode.has(shortCode)) throw new Error("Short code collision.");

    const row = {
      shortCode,
      originalUrl,
      clickCount: 0,
      createdAt: new Date(),
      lastClickedAt: null,
    };
    getLocalState().byOriginalUrl.set(originalUrl, shortCode);
    getLocalState().byCode.set(shortCode, row);
    return shortCode;
  }

  const inserted = await database`
    INSERT INTO urls (short_code, original_url)
    VALUES (${shortCode}, ${originalUrl})
    ON CONFLICT (short_code) DO NOTHING
    RETURNING short_code
  `;
  if (inserted[0]) return inserted[0].short_code;

  const existing = await findShortCodeByOriginalUrl(originalUrl);
  if (existing) return existing;
  throw new Error("Short code collision.");
}

export async function findUrlByShortCode(shortCode) {
  const database = getDatabase();
  if (!database) return getLocalState().byCode.get(shortCode)?.originalUrl ?? null;

  const rows = await database`
    SELECT original_url
    FROM urls
    WHERE short_code = ${shortCode}
    LIMIT 1
  `;
  return rows[0]?.original_url ?? null;
}
