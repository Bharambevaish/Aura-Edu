"use server";

/**
 * Demo-day helper: wipe all live data created by the seed, then re-seed.
 *
 * Lives in its own file (not lib/actions/auth.ts) because it is a demo-
 * lifecycle action, not an auth action — auth now only owns login/logout.
 * Demo accounts are re-upserted by email (stable ids), so the admin who clicks
 * Reset stays signed in; every *other* session is ended for a clean demo.
 * Manually created admins/students are never touched.
 *
 * Security: server actions are public POST endpoints — hiding the button is
 * not protection. The admin gate below runs before any DB access, so a
 * logged-out caller is redirected to /login and a staff/student caller to "/",
 * with nothing deleted.
 */

import { auth } from "@/auth";
import { requireRole } from "@/lib/dal";
import { connectDB } from "@/lib/db";
import { SessionModel } from "@/lib/models/Session";
import { TestModel } from "@/lib/models/Test";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { VendorModel } from "@/lib/models/Vendor";
import { ExpenseCategoryModel } from "@/lib/models/ExpenseCategory";
import { ExpenseModel } from "@/lib/models/Expense";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { RefundModel } from "@/lib/models/Refund";
import { WaiverModel } from "@/lib/models/Waiver";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { BatchModel } from "@/lib/models/Batch";
import { CourseModel } from "@/lib/models/Course";
import { AttendanceModel } from "@/lib/models/Attendance";
import { AssignmentModel } from "@/lib/models/Assignment";
import { seedDemoData } from "@/lib/seed/demo";

export async function resetDemoData(): Promise<void> {
  await requireRole(["admin"]);
  const mySessionId = (await auth())?.user?.sessionId;
  await connectDB();

  await ResultModel.deleteMany({});
  await AttemptModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await TestModel.deleteMany({});
  await SessionModel.deleteMany({ sessionId: { $ne: mySessionId } });
  await AuditLogModel.deleteMany({});
  await WaiverModel.deleteMany({});
  await RefundModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await InvoiceModel.deleteMany({});
  await ExpenseModel.deleteMany({});
  await ExpenseCategoryModel.deleteMany({});
  await VendorModel.deleteMany({});
  // Academic data is upserted by the seed, so anything created during a demo
  // (new batches, courses, registers, worksheets) would otherwise survive.
  await AssignmentModel.deleteMany({});
  await AttendanceModel.deleteMany({});
  await CourseModel.deleteMany({});
  await BatchModel.deleteMany({});
  await seedDemoData();
}