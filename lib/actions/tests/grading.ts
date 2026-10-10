"use server";

/**
 * STAFF-ONLY grading of written answers.
 *
 *  getGradingAccess     - tells the UI whether the signed-in user may grade
 *  getAttemptForGrading - loads one attempt with the full answer key
 *  gradeWrittenAnswers  - persists awarded marks + recomputes the score
 *
 * Per product decision, only `staff` grades written answers; admins see
 * reports but can't grade (requireRole(["staff"]) is enforced server-side).
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { getSession } from "@/lib/dal";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { GradeWrittenSchema } from "@/lib/validation";
import { sumWrittenScore, type QuestionDTO } from "@/lib/services/tests";

export type GradeScreenDTO = {
  attemptId: string;
  studentName: string;
  title: string;
  mcqScore: number;
  writtenScore: number;
  score: number;
  totalMarks: number;
  questions: QuestionDTO[];
};

/** Staff-only: loads one attempt with full question+answer details for grading. */
export async function getAttemptForGrading(attemptId: string): Promise<GradeScreenDTO | null> {
  await requireRole(["staff"]);
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
    };
  } catch {
    return null;
  }
}

/** Tells the UI whether the signed-in user may grade written answers (staff only). */
export async function getGradingAccess(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === "staff";
}

export type GradeOutcome = {
  success: boolean;
  writtenScore: number;
  score: number;
  remainingWritten: number;
  fullyGraded: boolean;
};

/** Staff-only: persists awarded marks for written answers and updates the score. */
export async function gradeWrittenAnswers(
  attemptId: string,
  grades: { questionId: string; marks: number }[],
): Promise<GradeOutcome> {
  await requireRole(["staff"]);
  const validated = GradeWrittenSchema.safeParse({ attemptId, grades });
  if (!validated.success) {
    return { success: false, writtenScore: 0, score: 0, remainingWritten: 0, fullyGraded: false };
  }

  await connectDB();
  const attempt = await AttemptModel.findById(attemptId).lean();
  if (!attempt) {
    return { success: false, writtenScore: 0, score: 0, remainingWritten: 0, fullyGraded: false };
  }

  const gradeMap = new Map(validated.data.grades.map((g) => [g.questionId, g.marks]));
  const rebuilt = attempt.answers.map((a) => {
    if (a.type === "written") {
      const awarded = gradeMap.get(String(a.questionId));
      if (awarded !== undefined) {
        return { ...a, awardedMarks: awarded, graded: true };
      }
    }
    return a;
  });

  const writtenScore = sumWrittenScore(rebuilt);
  const mcqScore = attempt.mcqScore;
  const score = mcqScore + writtenScore;
  const remainingWritten = rebuilt.filter((a) => a.type === "written" && !a.graded).length;
  const fullyGraded = remainingWritten === 0;

  await AttemptModel.updateOne(
    { _id: attempt._id },
    { $set: { answers: rebuilt, writtenScore, score, status: "submitted" } },
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

  return { success: true, writtenScore, score, remainingWritten, fullyGraded };
}