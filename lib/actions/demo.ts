"use server";

/**
 * Demo-day helper: wipe all live data created by the seed, then re-seed.
 *
 * Lives in its own file (not lib/actions/auth.ts) because it is a demo-
 * lifecycle action, not an auth action — auth now only owns login/logout.
 * Only removes accounts flagged isDemo and their coupled records, so any
 * manually created admin/student never gets destroyed by the demo button.
 */

import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
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
import { seedDemoData } from "@/lib/seed/demo";

export async function resetDemoData(): Promise<void> {
  await connectDB();

  await ResultModel.deleteMany({});
  await AttemptModel.deleteMany({});
  await QuestionModel.deleteMany({});
  await TestModel.deleteMany({});
  await SessionModel.deleteMany({});
  await AuditLogModel.deleteMany({});
  await WaiverModel.deleteMany({});
  await RefundModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await InvoiceModel.deleteMany({});
  await ExpenseModel.deleteMany({});
  await ExpenseCategoryModel.deleteMany({});
  await VendorModel.deleteMany({});
  await UserModel.deleteMany({ isDemo: true });
  await seedDemoData();
}