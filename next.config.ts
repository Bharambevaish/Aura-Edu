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
 *  - HSTS fires only over HTTPS (prod/Vercel); local http dev skips it.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://images.unsplash.com blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Strip extra headers that describe our framework/runtime — avoid
          // handing reconnaissance data to attackers.
          { key: "X-Powered-By", value: "MyEdou" },
          ...(isProd
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;