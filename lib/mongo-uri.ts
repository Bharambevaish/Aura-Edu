/**
 * Pure helpers for reading a MongoDB connection string without connecting.
 *
 * Used by lib/db.ts (which database to open) and scripts/seed.ts (refuse to
 * wipe a remote database by accident). Handles both `mongodb://` and
 * `mongodb+srv://`, with or without credentials, a database path or a query.
 * Never returns the credentials, so the results are safe to print.
 */

/** Used when neither the URI path nor MONGODB_DB names a database. */
export const DEFAULT_DB_NAME = "auraedu";

type ParsedUri = { hosts: string[]; dbName: string | null };

function parse(uri: string): ParsedUri | null {
  const match = /^mongodb(?:\+srv)?:\/\/(.*)$/i.exec(uri.trim());
  if (!match) return null;
  const rest = match[1];

  // Credentials must be URL-encoded, so the first "/" or "?" ends the host list.
  const end = rest.search(/[/?]/);
  const authority = end === -1 ? rest : rest.slice(0, end);
  const hostList = authority.slice(authority.lastIndexOf("@") + 1);
  const hosts = hostList
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean)
    // Strip the port; an IPv6 host keeps its brackets until the port is gone.
    .map((h) => h.replace(/:\d+$/, "").replace(/^\[(.*)\]$/, "$1").toLowerCase());

  let dbName: string | null = null;
  if (end !== -1 && rest[end] === "/") {
    const path = rest.slice(end + 1).split("?")[0];
    try {
      dbName = decodeURIComponent(path) || null;
    } catch {
      dbName = path || null;
    }
  }
  return { hosts, dbName };
}

/** The database named in the URI path (`.../AuraEdu?...` → "AuraEdu"), or null. */
export function dbNameFromUri(uri: string): string | null {
  return parse(uri)?.dbName ?? null;
}

/**
 * Which database to use: the URI path wins (so it never conflicts with the
 * URI on Atlas), then MONGODB_DB, then "auraedu".
 */
export function resolveDbName(uri: string, envDbName?: string): string {
  return dbNameFromUri(uri) ?? (envDbName?.trim() || DEFAULT_DB_NAME);
}

/** Host names in the URI (no ports, no credentials). */
export function hostsFromUri(uri: string): string[] {
  return parse(uri)?.hosts ?? [];
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

/** True only when every host in the URI is this machine. */
export function isLocalUri(uri: string): boolean {
  const hosts = hostsFromUri(uri);
  return hosts.length > 0 && hosts.every((h) => LOCAL_HOSTS.has(h));
}

/**
 * A connection string copied from Atlas still holding "<db_username>" /
 * "<db_password>" fails with a confusing server-selection or auth error;
 * name the real problem instead. Returns null when the URI looks usable.
 */
export function uriPlaceholderProblem(uri: string): string | null {
  return /<[^>]*>/.test(uri)
    ? "MONGODB_URI still contains placeholders like <db_username> or <db_password>. Replace them with your Atlas database user and password (URL-encode special characters)."
    : null;
}

export type SeedTarget =
  | { ok: true; remote: boolean; hosts: string[]; dbName: string }
  | { ok: false; reason: string };

/**
 * Seed-script guard: the seed wipes and rewrites collections, so a remote
 * database (Atlas) is only written with an explicit `--confirm-remote`.
 */
export function checkSeedTarget(uri: string | undefined, argv: string[], envDbName?: string): SeedTarget {
  if (!uri) return { ok: false, reason: "MONGODB_URI is not set." };
  const placeholder = uriPlaceholderProblem(uri);
  if (placeholder) return { ok: false, reason: placeholder };
  const hosts = hostsFromUri(uri);
  if (hosts.length === 0) return { ok: false, reason: "MONGODB_URI is not a mongodb:// or mongodb+srv:// URI." };
  const dbName = resolveDbName(uri, envDbName);
  const remote = !isLocalUri(uri);
  if (remote && !argv.includes("--confirm-remote")) {
    return {
      ok: false,
      reason:
        `MONGODB_URI points at a remote server (${hosts.join(", ")}). Seeding wipes and rewrites ` +
        `the "${dbName}" database. Run \`npm run seed:remote\` if you really mean it.`,
    };
  }
  return { ok: true, remote, hosts, dbName };
}

/**
 * Restore-script guard: like checkSeedTarget, a restore replaces every
 * collection, so a remote database also needs an explicit `--confirm-remote`.
 * (`--confirm-restore` itself is checked by the script after it prints the plan.)
 */
export function checkRestoreTarget(uri: string | undefined, argv: string[], envDbName?: string): SeedTarget {
  if (!uri) return { ok: false, reason: "MONGODB_URI is not set." };
  const placeholder = uriPlaceholderProblem(uri);
  if (placeholder) return { ok: false, reason: placeholder };
  const hosts = hostsFromUri(uri);
  if (hosts.length === 0) return { ok: false, reason: "MONGODB_URI is not a mongodb:// or mongodb+srv:// URI." };
  const dbName = resolveDbName(uri, envDbName);
  const remote = !isLocalUri(uri);
  if (remote && !argv.includes("--confirm-remote")) {
    return {
      ok: false,
      reason:
        `MONGODB_URI points at a remote server (${hosts.join(", ")}). Restoring replaces ` +
        `everything in the "${dbName}" database. Add --confirm-remote if you really mean it.`,
    };
  }
  return { ok: true, remote, hosts, dbName };
}
