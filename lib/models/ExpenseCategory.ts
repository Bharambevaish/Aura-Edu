import mongoose from "mongoose";

export interface ExpenseCategoryDoc {
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

const expenseCategorySchema = new mongoose.Schema<ExpenseCategoryDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ExpenseCategoryModel =
  (mongoose.models.ExpenseCategory as mongoose.Model<ExpenseCategoryDoc>) ??
  mongoose.model<ExpenseCategoryDoc>("ExpenseCategory", expenseCategorySchema);