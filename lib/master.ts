/**
 * Master Data lookup types (pure — safe for client and server). Each list
 * feeds a real picker in the app; renaming an entry updates the records that
 * use it, and an entry in use cannot be deleted (deactivate it instead).
 */
export const MASTER_TYPES = ["department", "designation", "id_proof", "lost_reason"] as const;
export type MasterType = (typeof MASTER_TYPES)[number];

export const MASTER_META: Record<MasterType, { label: string; usedIn: string; defaults: string[] }> = {
  department: {
    label: "Departments",
    usedIn: "Staff Corner → staff department",
    defaults: ["Academics", "Technology", "Finance", "Administration", "Front Office"],
  },
  designation: {
    label: "Designations",
    usedIn: "Staff Corner → staff designation",
    defaults: [
      "Chemistry Faculty & Academic Coordinator",
      "Senior Faculty — Physics",
      "Faculty — Biology",
      "Head of Mathematics",
      "Instructor — Python",
      "Accounts Executive",
      "Counsellor",
      "Centre Manager",
    ],
  },
  id_proof: {
    label: "ID Proof Types",
    usedIn: "Student Corner → add / edit student",
    defaults: ["Aadhar", "PAN", "Passport", "Driving Licence", "School ID"],
  },
  lost_reason: {
    label: "Lead Lost Reasons",
    usedIn: "Leads → follow-up → mark lost",
    defaults: ["Fees too high", "Joined another institute", "Not reachable", "Timing not suitable", "Postponed to next year"],
  },
};
