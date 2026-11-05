import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { findShortCodeByOriginalUrl, saveUrl } from "../../../lib/db";
import { isOwnServiceUrl, MAX_URL_LENGTH, validateUrl } from "../../../lib/url-validation";

export const runtime = "nodejs";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function createShortCode(originalUrl, length = 6) {
  const hex = createHash("sha256").update(originalUrl).digest("hex");
  let code = "";
  for (let i = 0; i < length; i += 1) {
    const value = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    code += ALPHABET[value % ALPHABET.length];
  }
  return code;
}

function errorResponse(code, message, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const raw = body?.originalUrl;
    const originalUrl = typeof raw === "string" ? raw.trim() : "";

    if (!originalUrl) {
      return errorResponse("MISSING_URL", "URL을 입력해 주세요.");
    }
    if (originalUrl.length > MAX_URL_LENGTH) {
      return errorResponse("URL_TOO_LONG", `URL은 ${MAX_URL_LENGTH}자 이하로 입력해 주세요.`);
    }

    const validationMessage = validateUrl(originalUrl);
    if (validationMessage) {
      return errorResponse("INVALID_URL", validationMessage);
    }
    if (isOwnServiceUrl(originalUrl, request)) {
      return errorResponse("SELF_URL", "자기 서비스 주소는 단축할 수 없습니다.");
    }

    const baseUrl = new URL(request.url).origin;
    const existingShortCode = await findShortCodeByOriginalUrl(originalUrl);
    if (existingShortCode) {
      return NextResponse.json({
        shortCode: existingShortCode,
        shortUrl: `${baseUrl}/${existingShortCode}`,
        originalUrl,
      }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    const shortCode = createShortCode(originalUrl);
    await saveUrl(shortCode, originalUrl);
    return NextResponse.json({
      shortCode,
      shortUrl: `${baseUrl}/${shortCode}`,
      originalUrl,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to create short URL", error);
    return errorResponse("INTERNAL_ERROR", "Failed to create short URL.", 500);
  }
}
