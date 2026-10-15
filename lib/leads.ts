/**
 * Client-safe lead labels and colours (shared by the Leads page and actions).
 * Lives outside the "use server" file, which may only export async functions.
 */
import type { LeadPriority, LeadSource, LeadStage } from "@/lib/models/Lead";

export const LEAD_STAGES: { value: LeadStage; label: string; pill: string }[] = [
  { value: "new", label: "New", pill: "bg-blue-900/30 text-blue-400 border-blue-900/50" },
  { value: "contacted", label: "Contacted", pill: "bg-purple-900/30 text-purple-300 border-purple-900/50" },
  { value: "follow_up", label: "Follow-up", pill: "bg-amber-900/30 text-amber-400 border-amber-900/50" },
  { value: "qualified", label: "Qualified", pill: "bg-cyan-900/30 text-cyan-300 border-cyan-900/50" },
  { value: "converted", label: "Converted", pill: "bg-green-900/30 text-green-400 border-green-900/50" },
  { value: "lost", label: "Lost", pill: "bg-red-900/30 text-red-400 border-red-900/50" },
];

export const LEAD_PRIORITIES: { value: LeadPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "web_register", label: "Online Admission" },
  { value: "form", label: "Web Form" },
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "referral", label: "Referral" },
  { value: "campaign", label: "Campaign" },
  { value: "other", label: "Other" },
];

export const stageLabel = (s: LeadStage) => LEAD_STAGES.find((x) => x.value === s)?.label ?? s;
export const stagePill = (s: LeadStage) => LEAD_STAGES.find((x) => x.value === s)?.pill ?? "";
export const sourceLabel = (s: LeadSource) => LEAD_SOURCES.find((x) => x.value === s)?.label ?? s;
