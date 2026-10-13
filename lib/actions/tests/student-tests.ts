"use server";

/**
 * STUDENT side of the Test Management module: the take-exam flow.
 *
 *  getStudentTests    - dashboard cards (attempts + transcripts merged)
 *  getTestIntro       - read-only preview for the Begin screen
 *  startStudentTest   - creates or resumes an attempt (never a duplicate)
 *  submitStudentTest  - auto-grades MCQ, indexes written answers as pending
 *
 * Every action requires the `student` role and strips the answer key before
 * any question reaches the browser (see toSafeQuestions in lib/services).
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { Types } from "mongoose";
import { TestModel } from "@/lib/models/Test";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { UserModel } from "@/lib/models/User";
import { SubmitTestSchema } from "@/lib/validation";
import {
  fmtDate,
  fmtTime,
  rankFor,
  hasSubmittedAttempt,
  findResult,
  toSafeQuestions,
  buildGradedAnswers,
  type QuestionDTO,
} from "@/lib/services/tests";
import { redirect } from "next/navigation";

export type TestCardDTO = {
  id: string;
  title: string;
  course: string;
  batch: string;
  date: string;
  time: string;
  durationMinutes: number;
  totalMarks: number;
  status: "Upcoming" | "Active Now" | "Completed";
  obtainedMarks?: number;
  rank?: number;
  totalStudents?: number;
  testId?: string;
};

/** The signed-in student's batch (tests are targeted at one batch each). */
async function myBatch(userId: string): Promise<string> {
  const me = await UserModel.findById(userId).select("batch").lean();
  return me?.batch ?? "";
}

/**
 * A student may open a test that targets their own batch, or one they have
 * already attempted (keeps history visible after a batch move).
 */
async function canAccessTest(userId: string, test: { _id: Types.ObjectId; batch: string }): Promise<boolean> {
  if (test.batch && test.batch === (await myBatch(userId))) return true;
  return !!(await AttemptModel.exists({ testId: test._id, userId }));
}

/** Student tests list (dashboard cards): real attempts + transcripts merged with test metadata. */
export async function getStudentTests(): Promise<TestCardDTO[]> {
  const { user } = await requireRole(["student"]);
  await connectDB();

  const now = new Date();
  const attempts = await AttemptModel.find({ userId: user.id }).lean();
  const results = await ResultModel.find({ userId: user.id }).lean();
  // Only tests for this student's batch, plus any they already attempted.
  const batch = await myBatch(user.id);
  const tests = await TestModel.find({
    $or: [{ batch }, { _id: { $in: attempts.map((a) => a.testId) } }],
  })
    .sort({ startAt: -1 })
    .limit(20)
    .lean();

  const out: TestCardDTO[] = [];

  for (const test of tests) {
    const result = results.find((r) => String(r.testId) === String(test._id));

    const base = {
      id: String(test._id),
      title: test.title,
      course: test.course,
      batch: test.batch,
      date: fmtDate(test.startAt),
      time: fmtTime(test.startAt),
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      testId: String(test._id),
    };

    if (result) {
      const { rank, total } = await rankFor(result);
      out.push({
        ...base,
        status: "Completed",
        obtainedMarks: result.obtained,
        rank,
        totalStudents: total,
      });
      continue;
    }

    const inProgress = attempts.find((a) => String(a.testId) === String(test._id) && a.status === "in_progress");
    if (inProgress) {
      out.push({ ...base, status: "Active Now" });
      continue;
    }

    if (now >= test.startAt && now <= test.endAt) {
      out.push({ ...base, status: "Active Now" });
    } else {
      out.push({ ...base, status: "Upcoming" });
    }
  }

  return out;
}

export type TestIntro =
  | {
      state: "intro";
      testId: string;
      title: string;
      subject: string;
      durationMinutes: number;
      totalMarks: number;
      passMarks: number;
      instructions: string;
      batch: string;
      status: "upcoming" | "active" | "completed";
    }
  | {
      state: "already_submitted";
      testId: string;
      title: string;
      result: {
        title: string;
        obtained: number;
        totalMarks: number;
        mcqScore: number;
        writtenScore: number;
        fullyGraded: boolean;
        submittedAt: string;
      } | null;
    };

/** Read-only test preview for the exam Begin screen; never creates an attempt. */
export async function getTestIntro(testId: string): Promise<TestIntro> {
  const { user } = await requireRole(["student"]);
  await connectDB();

  const test = Types.ObjectId.isValid(testId) ? await TestModel.findById(testId).lean() : null;
  if (!test || !(await canAccessTest(user.id, test))) redirect("/student-portal/tests");

  const submitted = await hasSubmittedAttempt(test._id, user.id);
  if (submitted) {
    const result = await findResult(test._id, user.id);
    return {
      state: "already_submitted",
      testId: String(test._id),
      title: test.title,
      result: result
        ? {
            title: test.title,
            obtained: result.obtained,
            totalMarks: test.totalMarks,
            mcqScore: result.mcqScore,
            writtenScore: result.writtenScore,
            fullyGraded: result.fullyGraded,
            submittedAt: result.submittedAt.toISOString(),
          }
        : null,
    };
  }

  return {
    state: "intro",
    testId: String(test._id),
    title: test.title,
    subject: test.subject,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    passMarks: test.passMarks,
    instructions: test.description,
    batch: test.batch,
    status: test.status,
  };
}

export type StartTestResult =
  | {
      state: "new" | "resume";
      attemptId: string;
      testId: string;
      title: string;
      subject: string;
      durationMinutes: number;
      totalMarks: number;
      passMarks: number;
      instructions: string;
      deadlineAt: string;
      questions: QuestionDTO[];
    }
  | {
      state: "already_submitted";
      result: {
        title: string;
        obtained: number;
        totalMarks: number;
        mcqScore: number;
        writtenScore: number;
        fullyGraded: boolean;
        submittedAt: string;
      } | null;
    };

/**
 * Creates (or resumes) a student's attempt. Returns safe questions (answer
 * key stripped) + deadline; "already_submitted" short-circuits so a student
 * can never start twice.
 */
export async function startStudentTest(testId: string): Promise<StartTestResult> {
  const { user } = await requireRole(["student"]);
  await connectDB();

  const test = Types.ObjectId.isValid(testId) ? await TestModel.findById(testId).lean() : null;
  if (!test || !(await canAccessTest(user.id, test))) redirect("/student-portal/tests");

  const result = await findResult(test._id, user.id);
  const submitted = await hasSubmittedAttempt(test._id, user.id);

  if (result && submitted) {
    return {
      state: "already_submitted",
      result: {
        title: test.title,
        obtained: result.obtained,
        totalMarks: test.totalMarks,
        mcqScore: result.mcqScore,
        writtenScore: result.writtenScore,
        fullyGraded: result.fullyGraded,
        submittedAt: result.submittedAt.toISOString(),
      },
    };
  }

  const existing = await AttemptModel.findOne({
    testId: test._id,
    userId: user.id,
    status: "in_progress",
  }).lean();

  const questions = await QuestionModel.find({ testId: test._id }).sort({ order: 1 }).lean();
  const safeQuestions = toSafeQuestions(questions);

  if (existing) {
    const withAnswers = mergeExistingAnswers(safeQuestions, existing.answers);
    return {
      state: "resume",
      attemptId: String(existing._id),
      testId: String(test._id),
      title: test.title,
      subject: test.subject,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      passMarks: test.passMarks,
      instructions: test.description,
      deadlineAt: existing.deadlineAt.toISOString(),
      questions: withAnswers,
    };
  }

  const startedAt = new Date();
  const deadlineAt = new Date(startedAt.getTime() + test.durationMinutes * 60 * 1000);

  const userId = new Types.ObjectId(user.id);
  const attempt = await AttemptModel.create({
    testId: test._id,
    userId,
    studentName: user.name || "Student",
    batch: test.batch,
    attemptNumber: 1,
    status: "in_progress",
    startedAt,
    deadlineAt,
    answers: safeQuestions.map((q) => ({
      questionId: new Types.ObjectId(q.id),
      type: q.type,
      selectedIndices: [],
      answerText: null,
      isCorrect: null,
      awardedMarks: null,
      graded: false,
    })),
    mcqScore: 0,
    writtenScore: 0,
    score: 0,
  });

  return {
    state: "new",
    attemptId: String(attempt._id),
    testId: String(test._id),
    title: test.title,
    subject: test.subject,
    durationMinutes: test.durationMinutes,
    totalMarks: test.totalMarks,
    passMarks: test.passMarks,
    instructions: test.description,
    deadlineAt: deadlineAt.toISOString(),
    questions: safeQuestions,
  };
}

function mergeExistingAnswers(
  questions: QuestionDTO[],
  answers: { questionId: unknown; selectedIndices?: number[] | null; answerText?: string | null; isCorrect?: boolean | null; awardedMarks?: number | null; graded?: boolean }[],
): QuestionDTO[] {
  return questions.map((q) => {
    const a = answers.find((x) => String(x.questionId) === q.id);
    return a
      ? { ...q, selectedIndices: a.selectedIndices ?? [], answerText: a.answerText ?? null }
      : q;
  });
}

export type SubmitTestOutcome = {
  testId: string;
  title: string;
  obtained: number;
  totalMarks: number;
  mcqScore: number;
  writtenScore: number;
  pendingWritten: number;
  fullyGraded: boolean;
  status: boolean;
};

export async function submitStudentTest(
  input: { attemptId: string; testId: string; answers: { questionId: string; selectedIndices?: number[] | null; answerText?: string | null }[] },
): Promise<SubmitTestOutcome> {
  const { user } = await requireRole(["student"]);
  const validated = SubmitTestSchema.safeParse(input);
  if (!validated.success) {
    return {
      testId: input.testId,
      title: "",
      obtained: 0,
      totalMarks: 0,
      mcqScore: 0,
      writtenScore: 0,
      pendingWritten: 0,
      fullyGraded: false,
      status: false,
    };
  }

  await connectDB();
  const attempt = await AttemptModel.findOne({
    _id: validated.data.attemptId,
    userId: user.id,
    status: "in_progress",
  }).lean();
  if (!attempt) redirect("/student-portal/tests");

  const test = await TestModel.findById(attempt.testId).lean();
  if (!test) redirect("/student-portal/tests");

  const questions = await QuestionModel.find({ testId: test._id }).sort({ order: 1 }).lean();

  const subByQ = new Map(validated.data.answers.map((a) => [a.questionId, a]));
  const { rebuilt, mcqScore, pendingWritten } = buildGradedAnswers(questions, subByQ);

  const submittedAt = new Date();
  const totalMarks = test.totalMarks;
  const fullyGraded = pendingWritten === 0;

  await AttemptModel.updateOne(
    { _id: attempt._id },
    {
      $set: {
        answers: rebuilt,
        mcqScore,
        writtenScore: 0,
        score: mcqScore,
        status: "submitted",
        submittedAt,
      },
    },
  );

  await ResultModel.findOneAndUpdate(
    { testId: test._id, userId: attempt.userId },
    {
      $set: {
        testId: test._id,
        userId: attempt.userId,
        attemptId: attempt._id,
        title: test.title,
        batch: test.batch,
        totalMarks,
        obtained: mcqScore,
        mcqScore,
        writtenScore: 0,
        fullyGraded,
        submittedAt,
      },
    },
    { upsert: true },
  );

  return {
    testId: String(test._id),
    title: test.title,
    obtained: mcqScore,
    totalMarks,
    mcqScore,
    writtenScore: 0,
    pendingWritten,
    fullyGraded,
    status: true,
  };
}