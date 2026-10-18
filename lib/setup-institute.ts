/**
 * First-admin setup for a REAL institute's database (`npm run setup:institute`).
 *
 * The demo seed writes publicly known accounts (admin@demo.auraedu.com /
 * Admin@123 …); a client institute must never have those. This creates only:
 * the institute profile (name + GST defaults), the Master Data defaults,
 * optionally the first branch, and one admin with a random one-time password
 * that must be changed at first sign-in.
 *
 * Pure helpers (argument parsing, the refuse/allow decision) are exported for
 * unit tests; `setupInstitute()` does the database work against whatever
 * connection lib/db.ts opened. No "server-only" import: it runs under tsx.
 */
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "@/lib/models/User";
import { InstituteSettingsModel, type TaxRule } from "@/lib/models/InstituteSettings";
import { MasterItemModel } from "@/lib/models/MasterItem";
import { BranchModel } from "@/lib/models/Branch";
import { MASTER_META, MASTER_TYPES } from "@/lib/master";
import { BranchSchema } from "@/lib/validation";
import { randomPassword } from "@/lib/password";
import { isDemoAccountDomain } from "@/lib/seed/guard";

export type SetupOptions = {
  adminName: string;
  adminEmail: string;
  /** Required for a fresh setup; not allowed with --add-admin. */
  instituteName?: string;
  /** Optional first branch; not allowed with --add-admin. */
  branchName?: string;
  addAdmin: boolean;
  confirmRemote: boolean;
};

export type ParsedArgs = { ok: true; help: true } | { ok: true; help: false; options: SetupOptions } | { ok: false; error: string };

export const SETUP_USAGE = `Usage:
  npm run setup:institute -- --name "Full Name" --email admin@institute.in --institute "Institute Name" [--branch "Main Branch"] [--confirm-remote]
  npm run setup:institute -- --add-admin --name "Full Name" --email second.admin@institute.in [--confirm-remote]

Flags (or environment variables):
  --name            SETUP_ADMIN_NAME       the admin's full name
  --email           SETUP_ADMIN_EMAIL      the admin's sign-in email
  --institute       SETUP_INSTITUTE_NAME   institute name (fresh setup only)
  --branch          SETUP_BRANCH_NAME      first branch to create (optional, fresh setup only)
  --add-admin                              add another admin to an institute that is already set up
  --confirm-remote                         required when MONGODB_URI is not on this computer`;

const VALUE_FLAGS = {
  "--name": "adminName",
  "--email": "adminEmail",
  "--institute": "instituteName",
  "--branch": "branchName",
} as const;
const BOOLEAN_FLAGS = new Set(["--add-admin", "--confirm-remote", "--help", "-h"]);

const OptionsSchema = z.object({
  adminName: z.string().trim().min(2, { message: "--name must be at least 2 characters." }).max(100),
  adminEmail: z.string().trim().toLowerCase().email({ message: "--email must be a valid email address." }),
  instituteName: z.string().trim().min(2, { message: "--institute must be at least 2 characters." }).max(150).optional(),
  branchName: BranchSchema.shape.name.optional(),
});

/** Parse CLI arguments (after `node script`) with env fallbacks. Never throws. */
export function parseSetupArgs(argv: string[], env: Record<string, string | undefined> = {}): ParsedArgs {
  const values: Partial<Record<(typeof VALUE_FLAGS)[keyof typeof VALUE_FLAGS], string>> = {};
  const flags = new Set<string>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eq = arg.indexOf("=");
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    if (flag in VALUE_FLAGS) {
      const value = eq === -1 ? argv[++i] : arg.slice(eq + 1);
      if (value === undefined || (eq === -1 && value.startsWith("--"))) return { ok: false, error: `${flag} needs a value.` };
      values[VALUE_FLAGS[flag as keyof typeof VALUE_FLAGS]] = value;
    } else if (BOOLEAN_FLAGS.has(arg)) {
      flags.add(arg);
    } else {
      return { ok: false, error: `Unknown argument "${arg}".` };
    }
  }
  if (flags.has("--help") || flags.has("-h")) return { ok: true, help: true };

  const pick = (v: string | undefined, envName: string) => {
    const s = (v ?? env[envName])?.trim();
    return s ? s : undefined;
  };
  const raw = {
    adminName: pick(values.adminName, "SETUP_ADMIN_NAME"),
    adminEmail: pick(values.adminEmail, "SETUP_ADMIN_EMAIL"),
    instituteName: pick(values.instituteName, "SETUP_INSTITUTE_NAME"),
    branchName: pick(values.branchName, "SETUP_BRANCH_NAME"),
  };
  const addAdmin = flags.has("--add-admin");

  if (!raw.adminName) return { ok: false, error: "--name (or SETUP_ADMIN_NAME) is required." };
  if (!raw.adminEmail) return { ok: false, error: "--email (or SETUP_ADMIN_EMAIL) is required." };
  if (addAdmin && (raw.instituteName || raw.branchName)) {
    return { ok: false, error: "--add-admin only adds an admin; drop --institute / --branch (change those in Settings)." };
  }
  if (!addAdmin && !raw.instituteName) return { ok: false, error: "--institute (or SETUP_INSTITUTE_NAME) is required." };

  const parsed = OptionsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid arguments." };
  if (isDemoAccountDomain(parsed.data.adminEmail)) {
    return { ok: false, error: "Demo accounts (@demo.auraedu.com) can't be created for a real institute. Use the institute's own email." };
  }

  return {
    ok: true,
    help: false,
    options: { ...parsed.data, addAdmin, confirmRemote: flags.has("--confirm-remote") },
  };
}

export type SetupDecision = { ok: true; mode: "fresh" | "add-admin" } | { ok: false; reason: string };

/** Whether setup may run, from what the database already holds. */
export function decideSetup(state: { userCount: number; emailTaken: boolean; addAdmin: boolean }): SetupDecision {
  if (state.addAdmin) {
    if (state.userCount === 0) {
      return { ok: false, reason: "This database has no users yet. Run setup without --add-admin to set up the institute first." };
    }
    if (state.emailTaken) return { ok: false, reason: "A user with that email already exists." };
    return { ok: true, mode: "add-admin" };
  }
  if (state.userCount > 0) {
    return {
      ok: false,
      reason:
        `This database already has ${state.userCount} user${state.userCount === 1 ? "" : "s"}, so the institute is already set up. ` +
        "Pass --add-admin to add another admin (nothing else changes).",
    };
  }
  return { ok: true, mode: "fresh" };
}

/** "Main Branch" → "BR-MAINBR"; always valid for BranchSchema's code rule. */
export function branchCode(name: string): string {
  const letters = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `BR-${letters || "01"}`;
}

/** Same GST rules as the demo institute (seedDemoInstitute), nothing institute-specific. */
export const DEFAULT_TAX_RULES: TaxRule[] = [
  { id: "gst-18", name: "GST on coaching services", rate: 18, hsn: "999293", description: "Commercial training and coaching services" },
  { id: "gst-0", name: "Exempt (books & study material)", rate: 0, hsn: "4901", description: "Printed books — nil rated" },
];

export type SetupResult =
  | { ok: true; mode: "fresh" | "add-admin"; email: string; password: string; branchCreated: boolean }
  | { ok: false; reason: string };

/**
 * Do the setup on the open connection. The admin is written last, so if
 * anything earlier fails the database still has no users and a rerun works.
 */
export async function setupInstitute(options: SetupOptions): Promise<SetupResult> {
  const email = options.adminEmail.trim().toLowerCase();
  if (isDemoAccountDomain(email)) return { ok: false, reason: "Demo accounts (@demo.auraedu.com) can't be created for a real institute." };

  const [userCount, emailTaken] = await Promise.all([UserModel.countDocuments({}), UserModel.exists({ email })]);
  const decision = decideSetup({ userCount, emailTaken: !!emailTaken, addAdmin: options.addAdmin });
  if (!decision.ok) return decision;

  let branchCreated = false;
  if (decision.mode === "fresh") {
    const name = options.instituteName!.trim();
    await InstituteSettingsModel.findOneAndUpdate(
      { key: "institute" },
      {
        $set: {
          name,
          legalName: name,
          address: "",
          gstin: "",
          pan: "",
          supportEmail: email,
          supportPhone: "",
          invoiceTerms: "This is a computer-generated invoice.",
          taxRules: DEFAULT_TAX_RULES,
          defaultTaxRuleId: "gst-18",
          staffCanGrade: true,
        },
      },
      { upsert: true },
    );

    // Master Data pickers: fill only the types that are still empty.
    for (const type of MASTER_TYPES) {
      if (await MasterItemModel.exists({ type })) continue;
      await MasterItemModel.insertMany(MASTER_META[type].defaults.map((item) => ({ type, name: item })));
    }

    if (options.branchName) {
      const branchName = options.branchName.trim();
      if (!(await BranchModel.exists({ name: branchName }))) {
        await BranchModel.create({ name: branchName, code: branchCode(branchName), createdByName: "Setup" });
        branchCreated = true;
      }
    }
  }

  const password = randomPassword();
  const admins = await UserModel.countDocuments({ role: "admin" });
  await UserModel.create({
    name: options.adminName.trim(),
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    employeeId: `EMP-${String(admins + 1).padStart(4, "0")}`,
    status: "Active",
    isDemo: false,
    mustChangePassword: true,
  });

  return { ok: true, mode: decision.mode, email, password, branchCreated };
}
