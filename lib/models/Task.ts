import mongoose from "mongoose";

/** Internal work item for the admin/staff team (Task Manager Kanban). */
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskDoc {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: mongoose.Types.ObjectId | null;
  assigneeName: string;
  dueDate: Date | null;
  createdById: mongoose.Types.ObjectId;
  createdByName: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<TaskDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo", index: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    assigneeName: { type: String, default: "Unassigned" },
    dueDate: { type: Date, default: null },
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: { type: String, default: "" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const TaskModel =
  (mongoose.models.Task as mongoose.Model<TaskDoc>) ?? mongoose.model<TaskDoc>("Task", taskSchema);
