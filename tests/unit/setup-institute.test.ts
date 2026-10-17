import { describe, expect, it } from "vitest";
import { branchCode, decideSetup, parseSetupArgs } from "@/lib/setup-institute";
import { demoSeedRefusal, isDemoAccountDomain, nonDemoEmails } from "@/lib/seed/guard";
import { checkSeedTarget } from "@/lib/mongo-uri";
import { BranchSchema } from "@/lib/validation";

const FRESH = ["--name", "Asha Rao", "--email", "Asha@Sunrise.in", "--institute", "Sunrise Academy"];

describe("parseSetupArgs", () => {
  it("reads a fresh setup from flags, lowercasing the email", () => {
    expect(parseSetupArgs([...FRESH, "--branch", "Main Branch", "--confirm-remote"])).toEqual({
      ok: true,
      help: false,
      options: {
        adminName: "Asha Rao",
        adminEmail: "asha@sunrise.in",
        instituteName: "Sunrise Academy",
        branchName: "Main Branch",
        addAdmin: false,
        confirmRemote: true,
      },
    });
  });

  it("accepts --flag=value and falls back to environment variables", () => {
    const result = parseSetupArgs(["--name=Asha Rao"], {
      SETUP_ADMIN_EMAIL: "asha@sunrise.in",
      SETUP_INSTITUTE_NAME: "Sunrise Academy",
    });
    expect(result.ok && !result.help && result.options).toMatchObject({
      adminName: "Asha Rao",
      adminEmail: "asha@sunrise.in",
      instituteName: "Sunrise Academy",
      confirmRemote: false,
    });
  });

  it("lets a flag win over the environment", () => {
    const result = parseSetupArgs(FRESH, { SETUP_ADMIN_NAME: "Someone Else" });
    expect(result.ok && !result.help && result.options.adminName).toBe("Asha Rao");
  });

  it("requires name, email and (for a fresh setup) the institute", () => {
    expect(parseSetupArgs(["--email", "a@b.in", "--institute", "X Academy"])).toMatchObject({ ok: false, error: expect.stringContaining("--name") });
    expect(parseSetupArgs(["--name", "Asha", "--institute", "X Academy"])).toMatchObject({ ok: false, error: expect.stringContaining("--email") });
    expect(parseSetupArgs(["--name", "Asha", "--email", "a@b.in"])).toMatchObject({ ok: false, error: expect.stringContaining("--institute") });
  });

  it("rejects bad emails, unknown flags and flags without values", () => {
    expect(parseSetupArgs(["--name", "Asha", "--email", "not-an-email", "--institute", "X Academy"]).ok).toBe(false);
    expect(parseSetupArgs([...FRESH, "--force"])).toMatchObject({ ok: false, error: expect.stringContaining("--force") });
    expect(parseSetupArgs(["--name", "--email", "a@b.in"])).toMatchObject({ ok: false, error: "--name needs a value." });
    expect(parseSetupArgs([...FRESH, "--branch"])).toMatchObject({ ok: false, error: "--branch needs a value." });
  });

  it("never allows a demo-domain admin", () => {
    const result = parseSetupArgs(["--name", "Admin", "--email", "admin@demo.auraedu.com", "--institute", "X Academy"]);
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("demo.auraedu.com") });
    expect(parseSetupArgs(["--add-admin", "--name", "Admin", "--email", "New@Demo.AuraEdu.com"]).ok).toBe(false);
  });

  it("--add-admin needs no institute and refuses to change the profile or branches", () => {
    const result = parseSetupArgs(["--add-admin", "--name", "Ravi Kumar", "--email", "ravi@sunrise.in"]);
    expect(result.ok && !result.help && result.options).toMatchObject({ addAdmin: true, instituteName: undefined });
    expect(parseSetupArgs(["--add-admin", ...FRESH]).ok).toBe(false);
    expect(parseSetupArgs(["--add-admin", "--name", "Ravi", "--email", "r@s.in", "--branch", "Pune"]).ok).toBe(false);
  });

  it("returns help for --help", () => {
    expect(parseSetupArgs(["--help"])).toEqual({ ok: true, help: true });
  });
});

describe("decideSetup", () => {
  it("runs a fresh setup only on a database with no users", () => {
    expect(decideSetup({ userCount: 0, emailTaken: false, addAdmin: false })).toEqual({ ok: true, mode: "fresh" });
    const refused = decideSetup({ userCount: 3, emailTaken: false, addAdmin: false });
    expect(refused).toMatchObject({ ok: false, reason: expect.stringContaining("--add-admin") });
    expect(decideSetup({ userCount: 1, emailTaken: true, addAdmin: false }).ok).toBe(false);
  });

  it("adds an admin only to a set-up institute, never over an existing email", () => {
    expect(decideSetup({ userCount: 1, emailTaken: false, addAdmin: true })).toEqual({ ok: true, mode: "add-admin" });
    expect(decideSetup({ userCount: 1, emailTaken: true, addAdmin: true }).ok).toBe(false);
    expect(decideSetup({ userCount: 0, emailTaken: false, addAdmin: true }).ok).toBe(false);
  });
});

describe("branchCode", () => {
  it("makes a code BranchSchema accepts", () => {
    expect(branchCode("Main Branch")).toBe("BR-MAINBR");
    expect(branchCode("नाशिक")).toBe("BR-01");
    for (const name of ["Main Branch", "Pune - FC Road", "नाशिक"]) {
      expect(BranchSchema.safeParse({ name, code: branchCode(name) }).success).toBe(true);
    }
  });
});

describe("checkSeedTarget with a custom remote message", () => {
  it("uses the caller's message and still names the host", () => {
    const atlas = "mongodb+srv://u:secret@cluster9.example.mongodb.net/Sunrise?retryWrites=true";
    const result = checkSeedTarget(atlas, [], undefined, (hosts, db) => `setup ${hosts[0]} ${db}`);
    expect(result).toEqual({ ok: false, reason: "setup cluster9.example.mongodb.net Sunrise" });
    expect(checkSeedTarget("mongodb+srv://<db_username>:<db_password>@c.mongodb.net/x", ["--confirm-remote"]).ok).toBe(false);
  });
});

describe("demo seed guard", () => {
  const demo = ["admin@demo.auraedu.com", "student@demo.auraedu.com"];

  it("allows an empty or demo-only database", () => {
    expect(demoSeedRefusal([], demo)).toBeNull();
    expect(demoSeedRefusal(["Admin@Demo.AuraEdu.com", "converted.lead@demo.auraedu.com"], demo)).toBeNull();
  });

  it("refuses any non-demo account and names a few of them", () => {
    const emails = [...demo, "asha@sunrise.in", "b@x.in", "c@x.in", "d@x.in"];
    expect(nonDemoEmails(emails, demo)).toEqual(["asha@sunrise.in", "b@x.in", "c@x.in", "d@x.in"]);
    const reason = demoSeedRefusal(emails, demo);
    expect(reason).toContain("4 accounts");
    expect(reason).toContain("asha@sunrise.in");
    expect(reason).toContain("1 more");
  });

  it("recognises only the exact demo domain", () => {
    expect(isDemoAccountDomain("x@demo.auraedu.com")).toBe(true);
    expect(isDemoAccountDomain("x@notdemo.auraedu.com")).toBe(false);
    expect(isDemoAccountDomain("x@demo.auraedu.com.evil.in")).toBe(false);
  });
});
