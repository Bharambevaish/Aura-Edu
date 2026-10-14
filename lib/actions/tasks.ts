"use server";

/**
 * Task Manager — internal Kanban for admins and staff. Everyone on the team
 * sees the board; deleting is limited to the task's creator, its assignee or
 * an admin.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { TaskModel, type TaskDoc, type TaskPriority, type TaskStatus } from "@/lib/models/Task";
import { UserModel } from "@/lib/models/User";
import { TaskSchema } from "@/lib/validation";

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  dueDate: string | null;
  createdByName: string;
  createdAt: string;
  canDelete: boolean;
};

type TaskLean = TaskDoc & { _id: mongoose.Types.ObjectId };

export async function getTasks(): Promise<{ me: string; tasks: TaskRow[]; people: { id: string; name: string }[] }> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const [tasks, people] = await Promise.all([
    TaskModel.find().sort({ dueDate: 1, createdAt: -1 }).limit(500).lean<TaskLean[]>(),
    UserModel.find({ role: { $in: ["admin", "staff"] }, isBlocked: { $ne: true } }).select("name").sort({ name: 1 }).lean(),
  ]);
  return {
    me: user.id,
    people: people.map((p) => ({ id: String(p._id), name: p.name })),
    tasks: tasks.map((t) => ({
      id: String(t._id),
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId ? String(t.assigneeId) : "",
      assigneeName: t.assigneeName ?? "Unassigned",
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
      createdByName: t.createdByName ?? "",
      createdAt: new Date(t.createdAt).toISOString(),
      canDelete:
        user.role === "admin" || String(t.createdById) === user.id || (!!t.assigneeId && String(t.assigneeId) === user.id),
    })),
  };
}

export type TaskOutcome = { ok: boolean; message: string };

async function resolveAssignee(id: string): Promise<{ assigneeId: mongoose.Types.ObjectId | null; assigneeName: string } | null> {
  if (!id) return { assigneeId: null, assigneeName: "Unassigned" };
  if (!mongoose.isValidObjectId(id)) return null;
  const person = await UserModel.findOne({ _id: id, role: { $in: ["admin", "staff"] } }).select("name").lean();
  return person ? { assigneeId: person._id as mongoose.Types.ObjectId, assigneeName: person.name } : null;
}

/** Create (id = null) or update a task. */
export async function saveTask(id: string | null, input: unknown): Promise<TaskOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = TaskSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid task." };
  if (id && !mongoose.isValidObjectId(id)) return { ok: false, message: "Task not found." };
  await connectDB();
  const d = parsed.data;
  const assignee = await resolveAssignee(d.assigneeId);
  if (!assignee) return { ok: false, message: "Pick a valid assignee." };
  const due = d.dueDate ? new Date(`${d.dueDate}T23:59:59`) : null;
  const fields = {
    title: d.title,
    description: d.description,
    priority: d.priority,
    status: d.status,
    dueDate: due && !Number.isNaN(due.getTime()) ? due : null,
    completedAt: d.status === "done" ? new Date() : null,
    ...assignee,
  };
  if (id) {
    const res = await TaskModel.updateOne({ _id: id }, { $set: fields });
    if (res.matchedCount === 0) return { ok: false, message: "Task not found." };
    await writeAudit(user, "updated task", d.title);
    return { ok: true, message: "Task updated." };
  }
  await TaskModel.create({ ...fields, createdById: new mongoose.Types.ObjectId(user.id), createdByName: user.name });
  await writeAudit(user, "created task", `${d.title} → ${assignee.assigneeName}`);
  return { ok: true, message: "Task created." };
}

/** Move a card between columns (drag-and-drop). */
export async function moveTask(id: string, status: TaskStatus): Promise<TaskOutcome> {
  await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id) || !["todo", "in_progress", "done"].includes(status)) {
    return { ok: false, message: "Invalid move." };
  }
  await connectDB();
  const res = await TaskModel.updateOne(
    { _id: id },
    { $set: { status, completedAt: status === "done" ? new Date() : null } },
  );
  return res.matchedCount ? { ok: true, message: "Task moved." } : { ok: false, message: "Task not found." };
}

export async function deleteTask(id: string): Promise<TaskOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Task not found." };
  await connectDB();
  const task = await TaskModel.findById(id).select("title createdById assigneeId").lean<TaskLean>();
  if (!task) return { ok: false, message: "Task not found." };
  const allowed =
    user.role === "admin" || String(task.createdById) === user.id || (!!task.assigneeId && String(task.assigneeId) === user.id);
  if (!allowed) return { ok: false, message: "Only the creator, the assignee or an admin can delete this task." };
  await TaskModel.deleteOne({ _id: id });
  await writeAudit(user, "deleted task", task.title);
  return { ok: true, message: "Task deleted." };
}
