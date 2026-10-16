/**
 * Next.js 16 Proxy (formerly middleware.ts).
 *
 * Purpose: cheap, edge-located gate that runs BEFORE a request reaches the
 * server rendering pipeline.
 *
 *   - An unauthenticated visitor asking for /admin-dashboard or /student-portal
 *     is bounced straight to /login without our server even rendering the page.
 *   - A logged-in user visiting /login is bounced to their own portal.
 *   - Every page gets a Content-Security-Policy with a fresh script nonce
 *     (lib/csp.ts). Next reads the nonce from the request header and applies
 *     it to its own scripts; the root layout renders dynamically so each
 *     response carries its own nonce.
 *
 * This is defense-in-depth only. Real enforcement lives server-side (layouts
 * and every data action call `requireRole()` in lib/dal.ts); the proxy just
 * short-circuits the obvious cases on the edge so unauthenticated dashboard
 * traffic never consumes render resources.
 *
 * NOTE: we deliberately do NOT import `@/auth` here — that module pulls in
 * mongoose (Node-only). Instead we decode the JWT cookie with `getToken`,
 * which works on any runtime via jose.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/lib/models/User";
import { buildCsp, frameAncestorsFor } from "@/lib/csp";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Web APIs only (btoa + crypto.randomUUID): Next 16 runs the proxy on Node.js
  // (Vercel included), but this also works unchanged on an edge runtime.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp({ nonce, dev: process.env.NODE_ENV === "development", frameAncestors: frameAncestorsFor(pathname) });
  const withCsp = (res: NextResponse) => {
    res.headers.set("Content-Security-Policy", csp);
    return res;
  };

  const redirect = await authRedirect(request, pathname);
  if (redirect) return withCsp(redirect);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }));
}

/** The sign-in gate: only /login and the two portals need the session. */
async function authRedirect(request: NextRequest, pathname: string): Promise<NextResponse | null> {
  const isDashboard = pathname.startsWith("/admin-dashboard");
  const isStudentPortal = pathname.startsWith("/student-portal");
  const isProtectedRoute = isDashboard || isStudentPortal;
  if (!isProtectedRoute && pathname !== "/login") return null;

  // Decode the signed Auth.js JWT (same cookie the layouts read). Returns
  // `null` when missing/expired/invalid — i.e. not signed in.
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    // Same rule Auth.js uses to name the cookie: the __Secure- prefix only
    // over HTTPS, judged from AUTH_URL when set, else the request itself.
    secureCookie: (process.env.AUTH_URL ? new URL(process.env.AUTH_URL).protocol : request.nextUrl.protocol) === "https:",
  });

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

  return null;
}

// Every page (for the CSP nonce). Skipped: /api/** (Auth.js's own routes and
// JSON), Next's static/image assets and files with an extension in /public.
export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};