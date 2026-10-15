import type { NextConfig } from "next";

/**
 * Global site configuration.
 *
 * `images.remotePatterns` — the landing page pulls Unsplash photos; Next's
 * image optimizer refuses to proxy/serve external hosts unless listed here.
 *
 * `headers()` (Phase B auth hardening) — sends one consistent set of security
 * headers on every response. Notes:
 *  - CSP is pragmatic, not paranoid: production-style restrictive CSP would
 *    need a full script-hash audit, so we allow 'unsafe-inline'/'unsafe-eval'
 *    (needed by Next's runtime and development tooling). The important wins —
 *    default-src 'self', connect-src 'self', frame-ancestors 'none',
 *    base-uri 'self', form-action 'self' — are all in place.
 *  - frame-ancestors 'none' + X-Frame-Options DENY defeats clickjacking of the
 *    exam screens (requestFullscreen, screenshare-style demos etc.).
 *  - The one exception is /f/<slug> (Form Builder public forms), which may be
 *    framed by any site so institutes can embed them; it gets
 *    frame-ancestors * and no X-Frame-Options. Every other path keeps DENY.
 *  - HSTS fires only over HTTPS (prod/Vercel); local http dev skips it.
 */
const nextConfig: NextConfig = {
  // Don't advertise the framework/runtime (no X-Powered-By header at all).
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = (frameAncestors: string) =>
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://images.unsplash.com blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        `frame-ancestors ${frameAncestors}`,
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ].join("; ");
    const common = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ...(isProd
        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
        : []),
    ];

    return [
      {
        // Everything except the public Form Builder pages: never framed.
        source: "/:path((?!f/).*)",
        headers: [
          { key: "Content-Security-Policy", value: csp("'none'") },
          { key: "X-Frame-Options", value: "DENY" },
          ...common,
        ],
      },
      {
        // /f/<slug> is the embeddable form — any site may <iframe> it
        // (it is public, holds no session data and only posts a lead).
        source: "/f/:slug*",
        headers: [{ key: "Content-Security-Policy", value: csp("*") }, ...common],
      },
    ];
  },
};

export default nextConfig;