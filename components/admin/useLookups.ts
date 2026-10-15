"use client";

import { useEffect, useState } from "react";
import { getLookups } from "@/lib/actions/master";
import { MASTER_META, type MasterType } from "@/lib/master";

/** Active Master Data lists for pickers; falls back to the defaults until loaded. */
export function useLookups(): Record<MasterType, string[]> {
  const [lists, setLists] = useState<Record<MasterType, string[]>>(() => ({
    department: MASTER_META.department.defaults,
    designation: MASTER_META.designation.defaults,
    id_proof: MASTER_META.id_proof.defaults,
    lost_reason: MASTER_META.lost_reason.defaults,
  }));
  useEffect(() => {
    let ignore = false;
    getLookups()
      .then((l) => {
        if (!ignore) setLists(l);
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);
  return lists;
}

/** Options for a select, keeping a record's current (maybe inactive) value. */
export function withValue(options: string[], current: string): string[] {
  return current && !options.includes(current) ? [current, ...options] : options;
}
