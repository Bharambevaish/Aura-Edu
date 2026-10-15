import mongoose from "mongoose";
import type { MasterType } from "@/lib/master";

/** One entry in a Master Data lookup list (see lib/master.ts). */
export interface MasterItemDoc {
  type: MasterType;
  name: string;
  description: string;
  active: boolean;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const masterItemSchema = new mongoose.Schema<MasterItemDoc>(
  {
    type: { type: String, required: true, enum: ["department", "designation", "id_proof", "lost_reason"], index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true },
    createdByName: { type: String, default: "System" },
  },
  { timestamps: true },
);
masterItemSchema.index({ type: 1, name: 1 }, { unique: true });

export const MasterItemModel =
  (mongoose.models.MasterItem as mongoose.Model<MasterItemDoc>) ??
  mongoose.model<MasterItemDoc>("MasterItem", masterItemSchema);
