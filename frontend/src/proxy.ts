// middleware.ts - CLEANER VERSION
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, ROUTE_GROUPS } from "@/lib/constants";

export async function proxy(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;
    const isAuthenticated = !!token;

    // Check route types using route groups
    const isAuthRoute = pathname === ROUTES.AUTH;
    const isProtectedRoute = ROUTE_GROUPS.PROTECTED.some((route) =>
      pathname.startsWith(route)
    );

    // Redirect authenticated users away from auth page
    if (isAuthenticated && isAuthRoute) {
      console.log(`✅ [AUTH] Redirecting to ${ROUTES.HOME}`);
      return NextResponse.redirect(new URL(ROUTES.HOME, req.url));
    }

    // Redirect unauthenticated users from protected routes
    if (!isAuthenticated && isProtectedRoute) {
      console.log(`❌ [AUTH] Redirecting to ${ROUTES.AUTH}`);
      const signInUrl = new URL(ROUTES.AUTH, req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Log access
    if (isProtectedRoute && isAuthenticated) {
      console.log(`🔒 [AUTH] ${token?.email} → ${pathname}`);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ [AUTH] Error:", error);
    return NextResponse.redirect(new URL(ROUTES.AUTH, req.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
