import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { isApprovedZodaEmail, shouldEnforceAuth } from "@/lib/auth";

function unauthorized(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, status: "unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function proxy(request: NextRequest) {
  if (!shouldEnforceAuth()) {
    return NextResponse.next();
  }

  const sessionToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (!sessionToken || !isApprovedZodaEmail(sessionToken.email)) {
    return unauthorized(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/api/sync/:path*"]
};
