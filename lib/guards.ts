/**
 * Input type guard for server actions (pure, unit-tested).
 *
 * Server actions are public HTTP endpoints: whatever the TypeScript signature
 * says, a caller can send any JSON. An object such as {"$ne": null} where the
 * code expects an id string would become a MongoDB query operator and match
 * other people's records (NoSQL operator injection, OWASP A03). Every action
 * that takes top-level string arguments calls this first.
 *
 * `undefined` is accepted for optional parameters; anything that is not a
 * string (objects, arrays, numbers, null) is rejected.
 */
export class InvalidInputError extends Error {
  constructor() {
    super("Invalid request.");
    this.name = "InvalidInputError";
  }
}

export function assertStrings(...values: unknown[]): void {
  for (const v of values) {
    if (v !== undefined && typeof v !== "string") throw new InvalidInputError();
  }
}
