import type { NextConfig } from "next";

/**
 * Global site configuration.
 *
 * `images.remotePatterns` — the landing page pulls Unsplash photos; Next's
 * image optimizer refuses to proxy/serve external hosts unless listed here.
 *
 * `headers()` — security headers on every response. The Content-Security-
 * Policy itself is set per request in proxy.ts (it carries a fresh script
 * nonce; see lib/csp.ts). Here:
 *  - X-Frame-Options DENY on everything except /f/<slug> (Form Builder public
 *    forms, which institutes embed); the CSP's frame-ancestors matches.
 *  - HSTS only in production (served over HTTPS).
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
        headers: [{ key: "X-Frame-Options", value: "DENY" }, ...common],
      },
      {
        // /f/<slug> is the embeddable form — any site may <iframe> it
        // (it is public, holds no session data and only posts a lead).
        source: "/f/:slug*",
        headers: common,
      },
    ];
  },
};

export default nextConfig;