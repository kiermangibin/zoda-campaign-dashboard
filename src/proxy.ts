import { NextResponse, type NextRequest } from "next/server";
import { shouldEnforceAuth } from "@/lib/auth";

export function proxy(request: NextRequest) {
  if (!shouldEnforceAuth()) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/api/sync/:path*"]
};
