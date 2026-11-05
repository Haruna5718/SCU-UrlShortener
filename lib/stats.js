import { getDatabase, getLocalState } from "./db";

export async function recordClick(shortCode) {
  const database = getDatabase();
  if (!database) {
    const row = getLocalState().byCode.get(shortCode);
    if (row) {
      row.clickCount += 1;
      row.lastClickedAt = new Date();
    }
    return;
  }

  await database`
    UPDATE urls
    SET click_count = click_count + 1, last_clicked_at = NOW()
    WHERE short_code = ${shortCode}
  `;
}

export async function getSummaryStats() {
  const database = getDatabase();
  if (!database) {
    const rows = [...getLocalState().byCode.values()];
    return {
      totalUrls: rows.length,
      totalClicks: rows.reduce((sum, row) => sum + row.clickCount, 0),
      clickedUrls: rows.filter((row) => row.clickCount > 0).length,
    };
  }

  const rows = await database`
    SELECT
      COUNT(*) AS total_urls,
      COALESCE(SUM(click_count), 0) AS total_clicks,
      COUNT(*) FILTER (WHERE click_count > 0) AS clicked_urls
    FROM urls
  `;
  const row = rows[0];
  return {
    totalUrls: Number(row.total_urls),
    totalClicks: Number(row.total_clicks),
    clickedUrls: Number(row.clicked_urls),
  };
}

export async function getTopUrl() {
  const database = getDatabase();
  if (!database) {
    const row = [...getLocalState().byCode.values()]
      .filter((item) => item.clickCount > 0)
      .sort((a, b) => b.clickCount - a.clickCount || b.createdAt - a.createdAt)[0];
    return row ? {
      shortCode: row.shortCode,
      originalUrl: row.originalUrl,
      clickCount: row.clickCount,
    } : null;
  }

  const rows = await database`
    SELECT short_code, original_url, click_count
    FROM urls
    WHERE click_count > 0
    ORDER BY click_count DESC, created_at DESC
    LIMIT 1
  `;
  const row = rows[0];
  return row ? {
    shortCode: row.short_code,
    originalUrl: row.original_url,
    clickCount: Number(row.click_count),
  } : null;
}

export async function getUrlStats() {
  const database = getDatabase();
  if (!database) {
    return [...getLocalState().byCode.values()]
      .sort((a, b) => b.clickCount - a.clickCount || b.createdAt - a.createdAt)
      .slice(0, 50)
      .map((row) => ({
        shortCode: row.shortCode,
        originalUrl: row.originalUrl,
        clickCount: row.clickCount,
        createdAt: row.createdAt,
        lastClickedAt: row.lastClickedAt,
      }));
  }

  const rows = await database`
    SELECT short_code, original_url, click_count, created_at, last_clicked_at
    FROM urls
    ORDER BY click_count DESC, created_at DESC
    LIMIT 50
  `;
  return rows.map((row) => ({
    shortCode: row.short_code,
    originalUrl: row.original_url,
    clickCount: Number(row.click_count),
    createdAt: row.created_at,
    lastClickedAt: row.last_clicked_at,
  }));
}
