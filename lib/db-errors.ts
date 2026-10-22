/**
 * Recognise "the database is unreachable or rejected us" (pure, unit-tested).
 *
 * Auth.js wraps errors thrown inside `authorize` (e.g. connectDB failing) in
 * its own AuthError, so walk the `cause` chain. Matches the MongoDB driver and
 * Mongoose error classes (MongoServerSelectionError, MongoServerError "bad
 * auth", MongoNetworkError, MongooseServerSelectionError…).
 */
export function isDatabaseError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    const name = (current as { name?: unknown }).name;
    if (typeof name === "string" && /^Mongo/.test(name)) return true;
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}

export const SIGN_IN_UNAVAILABLE =
  "Sign-in is temporarily unavailable because the database can't be reached. Please try again in a few minutes.";
