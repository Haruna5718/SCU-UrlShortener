// proxy.js
// 관리자 페이지는 로그인 폼을 렌더링하고, 통계 API가 인증을 검사합니다.

import { NextResponse } from "next/server";
import { authenticate } from "./lib/auth";
import { authorize } from "./lib/authorization";

function authenticationRequiredResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
      "Cache-Control": "no-store",
    },
  });
}

function forbiddenResponse() {
  return new NextResponse("Forbidden", {
    status: 403,
    headers: { "Cache-Control": "no-store" },
  });
}

export function proxy(request) {
  const user = authenticate(request);
  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  const isRscNavigation = request.headers.get("rsc") === "1";

  // Let browser navigations reach the password form; the stats API still requires auth.
  if (!user && !acceptsHtml && !isRscNavigation) {
    return authenticationRequiredResponse();
  }

  if (user && !authorize(user, "admin:page")) {
    return forbiddenResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
