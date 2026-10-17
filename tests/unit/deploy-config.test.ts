import { describe, expect, it } from "vitest";
import { checkSeedTarget, dbNameFromUri, hostsFromUri, isLocalUri, resolveDbName, uriPlaceholderProblem } from "@/lib/mongo-uri";
import { isDemoMode } from "@/lib/demo-mode";

const ATLAS = "mongodb+srv://owner:p%40ss%2Fw0rd@cluster2.1tgshhd.mongodb.net/AuraEdu?retryWrites=true&w=majority&appName=Cluster2";

describe("dbNameFromUri", () => {
  it("reads the path of an Atlas SRV URI, keeping its case", () => {
    expect(dbNameFromUri(ATLAS)).toBe("AuraEdu");
  });

  it("reads the path of a plain mongodb:// URI with and without a query", () => {
    expect(dbNameFromUri("mongodb://127.0.0.1:27017/auraedu")).toBe("auraedu");
    expect(dbNameFromUri("mongodb://127.0.0.1:27017/auraedu_e2e?directConnection=true")).toBe("auraedu_e2e");
    expect(dbNameFromUri("mongodb://a:1,b:2,c:3/AuraEdu?replicaSet=rs0")).toBe("AuraEdu");
  });

  it("returns null when the URI names no database", () => {
    expect(dbNameFromUri("mongodb://127.0.0.1:27017")).toBeNull();
    expect(dbNameFromUri("mongodb://127.0.0.1:27017/")).toBeNull();
    expect(dbNameFromUri("mongodb+srv://u:p@cluster2.1tgshhd.mongodb.net/?retryWrites=true")).toBeNull();
    expect(dbNameFromUri("mongodb+srv://u:p@cluster2.1tgshhd.mongodb.net?retryWrites=true")).toBeNull();
    expect(dbNameFromUri("not a uri")).toBeNull();
  });
});

describe("resolveDbName", () => {
  it("prefers the URI path, then MONGODB_DB, then auraedu", () => {
    expect(resolveDbName(ATLAS, "other")).toBe("AuraEdu");
    expect(resolveDbName("mongodb://127.0.0.1:27017/", "Custom")).toBe("Custom");
    expect(resolveDbName("mongodb://127.0.0.1:27017", "  ")).toBe("auraedu");
    expect(resolveDbName("mongodb://127.0.0.1:27017")).toBe("auraedu");
  });
});

describe("hostsFromUri / isLocalUri", () => {
  it("never exposes credentials and drops ports", () => {
    expect(hostsFromUri(ATLAS)).toEqual(["cluster2.1tgshhd.mongodb.net"]);
    expect(hostsFromUri("mongodb://u:p@[::1]:27017,localhost:27018/x")).toEqual(["::1", "localhost"]);
  });

  it("treats only localhost / 127.0.0.1 / ::1 as local", () => {
    expect(isLocalUri("mongodb://127.0.0.1:27105/auraedu_verify")).toBe(true);
    expect(isLocalUri("mongodb://localhost/auraedu")).toBe(true);
    expect(isLocalUri("mongodb://[::1]:27017/auraedu")).toBe(true);
    expect(isLocalUri(ATLAS)).toBe(false);
    expect(isLocalUri("mongodb://localhost:1,db.example.com:2/x")).toBe(false);
    expect(isLocalUri("garbage")).toBe(false);
  });
});

describe("checkSeedTarget", () => {
  it("seeds a local database without a flag", () => {
    expect(checkSeedTarget("mongodb://127.0.0.1:27017/auraedu", [])).toEqual({
      ok: true,
      remote: false,
      hosts: ["127.0.0.1"],
      dbName: "auraedu",
    });
  });

  it("refuses a remote database without --confirm-remote", () => {
    const result = checkSeedTarget(ATLAS, ["node", "seed.ts"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("cluster2.1tgshhd.mongodb.net");
      expect(result.reason).not.toContain("owner");
    }
  });

  it("allows a remote database with --confirm-remote and names the target", () => {
    expect(checkSeedTarget(ATLAS, ["node", "seed.ts", "--confirm-remote"])).toEqual({
      ok: true,
      remote: true,
      hosts: ["cluster2.1tgshhd.mongodb.net"],
      dbName: "AuraEdu",
    });
  });

  it("refuses a missing or malformed URI", () => {
    expect(checkSeedTarget(undefined, []).ok).toBe(false);
    expect(checkSeedTarget("postgres://x/y", ["--confirm-remote"]).ok).toBe(false);
  });
});

describe("isDemoMode", () => {
  it("is on only for DEMO_MODE=true", () => {
    expect(isDemoMode({ DEMO_MODE: "true" })).toBe(true);
    expect(isDemoMode({ DEMO_MODE: " TRUE " })).toBe(true);
  });

  it("is off when unset or anything else, so demo logins and reset stay hidden", () => {
    expect(isDemoMode({})).toBe(false);
    expect(isDemoMode({ DEMO_MODE: "" })).toBe(false);
    expect(isDemoMode({ DEMO_MODE: "false" })).toBe(false);
    expect(isDemoMode({ DEMO_MODE: "1" })).toBe(false);
    expect(isDemoMode({ DEMO_MODE: "yes" })).toBe(false);
  });
});

describe("uriPlaceholderProblem", () => {
  it("flags a URI copied from Atlas with its placeholders left in", () => {
    expect(uriPlaceholderProblem("mongodb+srv://<db_username>:<db_password>@cluster2.x.mongodb.net/AuraEdu")).toMatch(/placeholders/);
  });
  it("accepts a filled-in URI", () => {
    expect(uriPlaceholderProblem("mongodb+srv://app:S3cret@cluster2.x.mongodb.net/AuraEdu?retryWrites=true")).toBeNull();
  });
  it("makes the seed refuse a placeholder URI", () => {
    const r = checkSeedTarget("mongodb+srv://<db_username>:<db_password>@cluster2.x.mongodb.net/AuraEdu", ["--confirm-remote"]);
    expect(r.ok).toBe(false);
  });
});
