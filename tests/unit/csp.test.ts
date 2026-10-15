import { describe, expect, it } from "vitest";
import { buildCsp, frameAncestorsFor } from "@/lib/csp";

const directive = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("buildCsp", () => {
  it("allows scripts only with the request nonce in production", () => {
    const script = directive(buildCsp({ nonce: "abc123", dev: false, frameAncestors: "'none'" }), "script-src");
    expect(script).toContain("'nonce-abc123'");
    expect(script).toContain("'strict-dynamic'");
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
  });

  it("adds 'unsafe-eval' only in development", () => {
    expect(directive(buildCsp({ nonce: "n", dev: true, frameAncestors: "'none'" }), "script-src")).toContain("'unsafe-eval'");
  });

  it("locks down objects, base URI and form targets", () => {
    const csp = buildCsp({ nonce: "n", dev: false, frameAncestors: "'none'" });
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });
});

describe("frameAncestorsFor", () => {
  it("lets other sites embed only the public forms", () => {
    expect(frameAncestorsFor("/f/free-demo-class")).toBe("*");
    expect(frameAncestorsFor("/login")).toBe("'none'");
    expect(frameAncestorsFor("/forms")).toBe("'none'");
    expect(frameAncestorsFor("/admin-dashboard/lms/forms")).toBe("'none'");
  });
});
