import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during the server render and hydration, true afterwards.
 *
 * Use it around anything that reads the clock ("today", the current month,
 * a default date): the server (UTC on Vercel) and the browser (IST for most
 * users) can be on different days, and rendering both would make React
 * hydrate mismatched text (error #418).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
