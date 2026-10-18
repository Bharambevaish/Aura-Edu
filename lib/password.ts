/** Random one-time password, e.g. "KfR8mQ2x@HTWZ" (no look-alike characters). */
export function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const rnd = new Uint8Array(12);
  crypto.getRandomValues(rnd);
  for (const b of rnd) out += chars[b % chars.length];
  return `${out.slice(0, 8)}@${out.slice(8).toUpperCase()}`;
}
