/**
 * Content-Security-Policy builder (pure; used by proxy.ts, unit-tested).
 *
 * Scripts run only with this request's nonce. 'strict-dynamic' lets those
 * trusted scripts load Next's chunks, and there is no 'unsafe-inline' or
 * 'unsafe-eval' in production (React needs eval only in development).
 * Styles keep 'unsafe-inline': animation libraries set inline style
 * attributes, which nonces cannot cover, and style injection is far less
 * dangerous than script injection.
 */
export function buildCsp({ nonce, dev, frameAncestors }: { nonce: string; dev: boolean; frameAncestors: string }): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    `frame-ancestors ${frameAncestors}`,
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/** Only the public Form Builder pages (/f/<slug>) may be embedded by other sites. */
export function frameAncestorsFor(pathname: string): string {
  return pathname === "/f" || pathname.startsWith("/f/") ? "*" : "'none'";
}
