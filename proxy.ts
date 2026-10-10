/**
 * Next.js 16 Proxy (formerly middleware.ts).
 *
 * Purpose: cheap, edge-located gate that runs BEFORE a request reaches the
 * server rendering pipeline.
 *
 *   - An unauthenticated visitor asking for /admin-dashboard or /student-portal
 *     is bounced straight to /login without our server even rendering the page.
 *   - A logged-in user visiting /login is bounced to their own portal.
 *
 * This is defense-in-depth only. Real enforcement lives server-side (layouts
 * and every data action call `requireRole()` in lib/dal.ts); the proxy just
 * short-circuits the obvious cases on the edge so unauthenticated dashboard
 * traffic never consumes render resources.
 *
 * NOTE: we deliberately do NOT import `@/auth` here — that module pulls in
 * mongoose (Node-only). Instead we decode the JWT cookie with `getToken`,
 * which works on the edge runtime via jose.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/lib/models/User";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Decode the signed Auth.js JWT (same cookie the layouts read). Returns
  // `null` when missing/expired/invalid — i.e. not signed in.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // Prod serves over HTTPS => cookie uses the secure prefix; match it here.
    secureCookie: process.env.NODE_ENV === "production",
  });

  const isDashboard = pathname.startsWith("/admin-dashboard");
  const isStudentPortal = pathname.startsWith("/student-portal");
  const isProtectedRoute = isDashboard || isStudentPortal;

  if (isProtectedRoute && !token) {
    // Not signed in: send to the login page, keeping the target URL so the
    // login flow could restore it later if we add that convenience.
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && token) {
    // Already signed in: nobody re-enrolls into a portal they've entered.
    // Pick the home matching the session role (role is carried in the JWT).
    const role = (token.role as Role | undefined) ?? "student";
    return NextResponse.redirect(
      new URL(role === "student" ? "/student-portal" : "/admin-dashboard", request.url),
    );
  }

  return NextResponse.next();
}

// Run the gate only on the routing paths that need it. Everything else
// (landing page, /register admissions flow, /api/**) is intentionally bypassed
// for performance and to avoid interfering with Auth.js's own /api/auth routes.
export const config = {
  matcher: ["/admin-dashboard/:path*", "/student-portal/:path*", "/login"],
};