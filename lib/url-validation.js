export const MAX_URL_LENGTH = 2048;

export function validateUrl(value) {
  const trimmedUrl = typeof value === "string" ? value.trim() : "";
  if (!trimmedUrl) return "URL을 입력해 주세요.";
  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return `URL은 ${MAX_URL_LENGTH}자 이하로 입력해 주세요.`;
  }
  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return "URL은 http:// 또는 https://로 시작해야 합니다.";
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    const hasDomain = hostname.includes(".") || hostname === "localhost" || hostname.includes(":");
    if (!["http:", "https:"].includes(parsedUrl.protocol) || !hostname || !hasDomain) {
      return "올바른 URL 형식으로 입력해 주세요";
    }
  } catch {
    return "올바른 URL 형식으로 입력해 주세요";
  }

  return null;
}

function hostname(value) {
  if (!value) return null;
  try {
    const candidate = value.includes("://") ? value : `https://${value}`;
    return new URL(candidate).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

export function isOwnServiceUrl(originalUrl, request) {
  const originalHost = hostname(originalUrl);
  if (!originalHost) return false;

  const candidates = [
    new URL(request.url).host,
    request.headers.get("x-forwarded-host"),
    request.headers.get("host"),
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].flatMap((value) => (value ?? "").split(","));

  return candidates.some((value) => hostname(value.trim()) === originalHost);
}
