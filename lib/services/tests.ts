/**
 * Shared business logic + types for the Test Management crown jewel.
 *
 * Server actions (lib/actions/tests/*) used to duplicate this logic: the
 * "already submitted" lookup, the safe-question projection (answer key
 * stripped), the MCQ exact-set scoring, and the written-score recompute. All
 * of those now converge here so the student take-exam flow, the admin report
 * flow and the grading flow can never drift apart again.
 */

import type { Types } from "mongoose";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";

export type QuestionDTO = {
  id: string;
  type: "mcq" | "written";
  text: string;
  options: string[];
  marks: number;
  order: number;
  allowMultiple?: boolean;
  selectedIndices?: number[] | null;
  answerText?: string | null;
  isCorrect?: boolean | null;
  awardedMarks?: number | null;
  graded?: boolean;
};

export function fmtTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(date: Date): string {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Rank of a result within its test (1 = top score), plus total students. */
export async function rankFor(result: { testId: Types.ObjectId; obtained: number }): Promise<{ rank: number; total: number }> {
  const totals = await ResultModel.find({ testId: result.testId }).select("obtained").lean();
  const rank = totals.filter((r) => r.obtained > result.obtained).length + 1;
  return { rank, total: totals.length };
}

/** True if this student already has a submitted attempt for the test. */
export async function hasSubmittedAttempt(testId: Types.ObjectId | string, userId: string): Promise<boolean> {
  const existing = await AttemptModel.findOne({
    testId,
    userId,
    status: "submitted",
  }).select("_id").lean();
  return Boolean(existing);
}

/** The official result doc for a (student, test) pair, if one exists. */
export async function findResult(testId: Types.ObjectId | string, userId: string) {
  return ResultModel.findOne({ testId, userId }).lean();
}

/**
 * Strips the answer key: maps DB question docs to the shape a student is
 * allowed to see (no `correctIndices`). `allowMultiple` is derived so the UI
 * knows to render checkboxes vs radios.
 */
export function toSafeQuestions(questions: {
  _id: unknown;
  type: string;
  text: string;
  options: string[];
  marks: number;
  order: number;
  correctIndices: number[];
}[]): QuestionDTO[] {
  return questions.map((q) => ({
    id: String(q._id),
    type: q.type === "mcq" ? "mcq" : "written",
    text: q.text,
    options: q.options,
    marks: q.marks,
    order: q.order,
    allowMultiple: q.type === "mcq" && q.correctIndices.length > 1,
  }));
}

/**
 * Auto-grades MCQ by exact-set match and indexes written answers as pending.
 * Builds the rebuilt `answers` array used at submit time.
 */
export function buildGradedAnswers(
  questions: { _id: unknown; type: string; correctIndices: number[]; marks: number }[],
  submittedByQ: Map<string, { selectedIndices?: number[] | null; answerText?: string | null } | undefined>,
): { rebuilt: unknown[]; mcqScore: number; pendingWritten: number } {
  let mcqScore = 0;
  let pendingWritten = 0;
  const rebuilt: unknown[] = [];

  for (const q of questions) {
    const submitted = submittedByQ.get(String(q._id));

    if (q.type === "mcq") {
      const indices = [...new Set(submitted?.selectedIndices ?? [])].sort((a, b) => a - b);
      const correct = [...q.correctIndices].sort((a, b) => a - b);
      const isCorrect =
        correct.length > 0 &&
        indices.length === correct.length &&
        correct.every((i) => indices.includes(i));
      const awarded = isCorrect ? q.marks : 0;
      if (isCorrect) mcqScore += q.marks;
      rebuilt.push({
        questionId: q._id,
        type: "mcq" as const,
        selectedIndices: indices,
        answerText: null,
        isCorrect,
        awardedMarks: awarded,
        graded: true,
      });
    } else {
      // A blank written answer scores 0 straight away; an answered one waits
      // for a teacher, so the result is not fully graded until then.
      const answerText = submitted?.answerText?.trim() || null;
      if (answerText) pendingWritten++;
      rebuilt.push({
        questionId: q._id,
        type: "written" as const,
        selectedIndices: [],
        answerText,
        isCorrect: null,
        awardedMarks: answerText ? null : 0,
        graded: !answerText,
      });
    }
  }

  return { rebuilt, mcqScore, pendingWritten };
}

/** Sum of awarded marks across graded written answers (used by grading). */
export function sumWrittenScore(answers: { type: string; graded?: boolean; awardedMarks?: number | null }[]): number {
  return answers.reduce(
    (sum, a) => (a.type === "written" && a.graded ? sum + (a.awardedMarks ?? 0) : sum),
    0,
  );
}
type WrittenAnswer = { questionId: unknown; type: string; graded?: boolean; awardedMarks?: number | null };

/**
 * Apply a teacher's marks to written answers. Marks are clamped to
 * [0, question max]; grades for unknown or MCQ questions are ignored.
 */
export function applyWrittenGrades<A extends WrittenAnswer>(
  answers: A[],
  grades: Map<string, number>,
  maxMarks: Map<string, number>,
): { rebuilt: A[]; writtenScore: number; remainingWritten: number } {
  const rebuilt = answers.map((a) => {
    if (a.type !== "written") return a;
    const id = String(a.questionId);
    const awarded = grades.get(id);
    const max = maxMarks.get(id);
    if (awarded === undefined || max === undefined) return a;
    return { ...a, awardedMarks: Math.min(Math.max(0, awarded), max), graded: true };
  });
  return {
    rebuilt,
    writtenScore: sumWrittenScore(rebuilt),
    remainingWritten: rebuilt.filter((a) => a.type === "written" && !a.graded).length,
  };
}
