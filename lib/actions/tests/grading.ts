"use server";

/**
 * Grading of written answers.
 *
 *  getGradingAccess     - tells the UI whether the signed-in user may grade
 *  getAttemptForGrading - loads one attempt with the full answer key
 *  gradeWrittenAnswers  - persists awarded marks + recomputes the score
 *
 * Admins can always grade; staff can grade while the institute setting
 * "Staff can grade written answers" is on (canGradeWritten in
 * lib/permissions.ts). gradeWrittenAnswers enforces it server-side; staff
 * can still open an attempt to read it when grading is locked.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { getStaffCanGrade } from "@/lib/institute";
import { canGradeWritten, GRADING_LOCKED_MESSAGE } from "@/lib/permissions";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { GradeWrittenSchema } from "@/lib/validation";
import { applyWrittenGrades, type QuestionDTO } from "@/lib/services/tests";

export type GradeScreenDTO = {
  attemptId: string;
  studentName: string;
  title: string;
  mcqScore: number;
  writtenScore: number;
  score: number;
  totalMarks: number;
  questions: QuestionDTO[];
  /** Whether the signed-in user may save grades on this screen. */
  canGrade: boolean;
  /** Who last saved written grades, if anyone. ISO date. */
  gradedBy: { name: string; role: "admin" | "staff"; at: string } | null;
};

/** The signed-in admin/staff user and whether they may grade right now. */
async function gradingUser() {
  const { user } = await requireRole(["admin", "staff"]);
  const staffCanGrade = user.role === "staff" ? await getStaffCanGrade() : true;
  return { user, canGrade: canGradeWritten(user.role, staffCanGrade) };
}

/** Admin + staff: loads one attempt with full question+answer details for grading. */
export async function getAttemptForGrading(attemptId: string): Promise<GradeScreenDTO | null> {
  const { canGrade } = await gradingUser();
  await connectDB();

  try {
    const attempt = await AttemptModel.findById(attemptId).populate("testId").lean();
    if (!attempt) return null;

    const test = attempt.testId as unknown as { _id: unknown; title: string; totalMarks: number } | null;
    const questions = await QuestionModel.find({ testId: attempt.testId }).sort({ order: 1 }).lean();

    const byQ = new Map(attempt.answers.map((a) => [String(a.questionId), a]));

    const dtos: QuestionDTO[] = questions.map((q) => {
      const a = byQ.get(String(q._id));
      return {
        id: String(q._id),
        type: q.type === "mcq" ? "mcq" : "written",
        text: q.text,
        options: q.options,
        marks: q.marks,
        order: q.order,
        allowMultiple: q.type === "mcq" && q.correctIndices.length > 1,
        selectedIndices: a?.selectedIndices ?? [],
        answerText: a?.answerText ?? null,
        isCorrect: a?.isCorrect ?? null,
        awardedMarks: a?.awardedMarks ?? null,
        graded: a?.graded ?? false,
      };
    });

    return {
      attemptId: String(attempt._id),
      studentName: attempt.studentName,
      title: test?.title ?? "Test",
      mcqScore: attempt.mcqScore,
      writtenScore: attempt.writtenScore,
      score: attempt.score,
      totalMarks: test?.totalMarks ?? 0,
      questions: dtos,
      canGrade,
      gradedBy:
        attempt.graderName && attempt.graderRole && attempt.gradedAt
          ? { name: attempt.graderName, role: attempt.graderRole, at: new Date(attempt.gradedAt).toISOString() }
          : null,
    };
  } catch {
    return null;
  }
}

/** Tells the UI whether the signed-in user may grade written answers (same rule as gradeWrittenAnswers). */
export async function getGradingAccess(): Promise<boolean> {
  return (await gradingUser()).canGrade;
}

export type GradeOutcome = {
  success: boolean;
  writtenScore: number;
  score: number;
  remainingWritten: number;
  fullyGraded: boolean;
  message?: string;
};

/** Admin always, staff while allowed: persists awarded marks for written answers and updates the score. */
export async function gradeWrittenAnswers(
  attemptId: string,
  grades: { questionId: string; marks: number }[],
): Promise<GradeOutcome> {
  const { user, canGrade } = await gradingUser();
  if (!canGrade) {
    return { success: false, writtenScore: 0, score: 0, remainingWritten: 0, fullyGraded: false, message: GRADING_LOCKED_MESSAGE };
  }
  const validated = GradeWrittenSchema.safeParse({ attemptId, grades });
  if (!validated.success) {
    return { success: false, writtenScore: 0, score: 0, remainingWritten: 0, fullyGraded: false };
  }

  await connectDB();
  const attempt = await AttemptModel.findById(attemptId).lean();
  if (!attempt) {
    return { success: false, writtenScore: 0, score: 0, remainingWritten: 0, fullyGraded: false };
  }

  // Marks are capped at each question's maximum, read from the test itself.
  const questions = await QuestionModel.find({ testId: attempt.testId }).select("_id marks").lean();
  const maxMarks = new Map(questions.map((q) => [String(q._id), q.marks]));
  const gradeMap = new Map(validated.data.grades.map((g) => [g.questionId, g.marks]));
  const { rebuilt, writtenScore, remainingWritten } = applyWrittenGrades(attempt.answers, gradeMap, maxMarks);

  const mcqScore = attempt.mcqScore;
  const score = mcqScore + writtenScore;
  const fullyGraded = remainingWritten === 0;

  await AttemptModel.updateOne(
    { _id: attempt._id },
    {
      $set: {
        answers: rebuilt,
        writtenScore,
        score,
        status: "submitted",
        graderName: user.name,
        graderRole: user.role === "admin" ? "admin" : "staff",
        gradedAt: new Date(),
      },
    },
  );

  await ResultModel.updateOne(
    { attemptId: attempt._id },
    {
      $set: {
        obtained: score,
        writtenScore,
        fullyGraded,
      },
    },
  );

  await writeAudit(user, "graded written answers", `${attempt.studentName} — written ${writtenScore}, total ${score}`);
  return { success: true, writtenScore, score, remainingWritten, fullyGraded };
}