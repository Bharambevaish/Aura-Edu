"use server";

/**
 * ADMIN + STAFF side of Test Management: management list, per-student cards,
 * per-test attempt reports and test creation.
 *
 *  getAdminTests        - management list + headline stats
 *  getAdminTestCards    - per-student tiered cards
 *  getAdminAttempts     - attempt rows for one test's report screen
 *  createTest           - validate + persist a test and its questions
 *
 * Written-answer grading lives in grading.ts (staff-only).
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { getSession } from "@/lib/dal";
import { Types } from "mongoose";
import { TestModel } from "@/lib/models/Test";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { UserModel } from "@/lib/models/User";
import { CreateTestSchema } from "@/lib/validation";
import { fmtDate, fmtDateTime, ranksFor } from "@/lib/services/tests";

export type AdminTestDTO = {
  id: string;
  title: string;
  subject: string;
  course: string;
  batch: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  totalMarks: number;
  passMarks: number;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  attempts: number;
  results: number;
  passRate: number;
};

/** Admin test-management list: stats + per-test rows (results/pass-rate). */
export async function getAdminTests(): Promise<{ stats: { totalTests: number; totalAttempts: number; completed: number; passRate: number }; tests: AdminTestDTO[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const tests = await TestModel.find().sort({ startAt: -1 }).lean();
  const attempts = await AttemptModel.find({ status: "submitted" }).lean();
  const results = await ResultModel.find().lean();

  const testsDto: AdminTestDTO[] = tests.map((test) => {
    const testAttempts = attempts.filter((a) => String(a.testId) === String(test._id));
    const testResults = results.filter((r) => String(r.testId) === String(test._id));
    const passMarks = test.passMarks || 0;
    const passRate = testResults.length === 0 ? 0 : Math.round((testResults.filter((r) => r.obtained > passMarks).length / testResults.length) * 100);
    return {
      id: String(test._id),
      title: test.title,
      subject: test.subject,
      course: test.course,
      batch: test.batch,
      description: test.description,
      status: test.status,
      totalMarks: test.totalMarks,
      passMarks: test.passMarks,
      durationMinutes: test.durationMinutes,
      startsAt: fmtDateTime(test.startAt),
      endsAt: fmtDateTime(test.endAt),
      attempts: testAttempts.length,
      results: testResults.length,
      passRate,
    };
  });

  const totalAttempts = attempts.length;
  const totalResults = results.length;
  const passRate = totalResults === 0 ? 0 : Math.round((results.filter((r) => r.obtained > (r.totalMarks * 0.4)).length / totalResults) * 100);

  return {
    stats: {
      totalTests: tests.length,
      totalAttempts,
      completed: totalResults,
      passRate,
    },
    tests: testsDto,
  };
}

export type TestCardRowDTO = {
  id: string;
  name: string;
  email: string;
  admissionNo: string;
  batch: string;
  attempts: number;
  lastAttempt: string | null;
  avgPct: number | null;
  tier: "strong" | "average" | "at_risk" | "none";
};

/** Admin per-student test cards with tiering, for the test-cards screen. */
export async function getAdminTestCards(): Promise<{ stats: { students: number; attempts: number; attempted: number; notAttempted: number; avgPct: number; topPct: number }; cards: TestCardRowDTO[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const students = await UserModel.find({ role: "student" }).lean();
  const attempts = await AttemptModel.find({ status: "submitted" }).lean();
  const results = await ResultModel.find().lean();

  const cards: TestCardRowDTO[] = [];
  let totalAttempts = 0;
  let attempted = 0;
  let pctSum = 0;
  let pctCount = 0;
  let topPct = 0;

  for (const student of students) {
    const sResults = results.filter((r) => String(r.userId) === String(student._id));
    const sAttempts = attempts.filter((a) => String(a.userId) === String(student._id));
    totalAttempts += sAttempts.length;
    if (sResults.length > 0) attempted++;

    const pcts = sResults.map((r) => (r.totalMarks > 0 ? (r.obtained / r.totalMarks) * 100 : 0));
    const avgPct = pcts.length ? pcts.reduce((a, b) => a + b, 0) / pcts.length : null;
    if (avgPct !== null) {
      pctSum += avgPct;
      pctCount++;
      topPct = Math.max(topPct, avgPct);
    }

    const tier = avgPct === null ? "none" : avgPct >= 75 ? "strong" : avgPct >= 40 ? "average" : "at_risk";
    const lastAttempt = sAttempts.length ? fmtDate(sAttempts[sAttempts.length - 1].submittedAt ?? new Date()) : null;

    cards.push({
      id: String(student._id),
      name: student.name,
      email: student.email,
      admissionNo: student.admissionNo ?? "-",
      batch: student.batch ?? "-",
      attempts: sAttempts.length,
      lastAttempt,
      avgPct: avgPct === null ? null : Math.round(avgPct * 100) / 100,
      tier,
    });
  }

  return {
    stats: {
      students: students.length,
      attempts: totalAttempts,
      attempted,
      notAttempted: students.length - attempted,
      avgPct: pctCount ? Math.round((pctSum / pctCount) * 100) / 100 : 0,
      topPct: Math.round(topPct * 100) / 100,
    },
    cards,
  };
}

export type AttemptRowDTO = {
  id: string;
  studentName: string;
  score: number;
  totalMarks: number;
  submittedAt: string;
  pendingWritten: number;
  multipleAttempts: number;
};

/** Attempt rows for one test's report screen (score, written-pending, grade link). */
export async function getAdminAttempts(testId: string): Promise<AttemptRowDTO[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const test = await TestModel.findById(testId).lean();
  if (!test) return [];

  const attempts = await AttemptModel.find({ testId: test._id, status: "submitted" })
    .sort({ submittedAt: -1 })
    .limit(100)
    .lean();

  return attempts.map((a) => ({
    id: String(a._id),
    studentName: a.studentName,
    score: a.score,
    totalMarks: test.totalMarks,
    submittedAt: fmtDateTime(a.submittedAt ?? new Date()),
    pendingWritten: a.answers.filter((x) => x.type === "written" && !x.graded).length,
    multipleAttempts: 1,
  }));
}

export type TestCardDetailDTO = {
  student: {
    id: string;
    name: string;
    email: string;
    admissionNo: string;
    rollNo: string;
    batch: string;
    course: string | null;
  };
  summary: {
    completed: number;
    avgPct: number;
    bestPct: number;
    bestRank: number;
    passRate: number;
    grade: string;
    percentile: number;
    pendingWritten: number;
  };
  rows: {
    testId: string;
    title: string;
    subject: string;
    date: string;
    marks: number;
    totalMarks: number;
    pct: number;
    rank: number;
    totalStudents: number;
    passed: boolean;
    fullyGraded: boolean;
  }[];
};

/**
 * Admin/staff: full transcript for one student's test card — every graded
 * result with batch rank, plus the headline summary. Mirrors what the student
 * portal test-card shows (accurate from live `results` data).
 */
export async function getAdminTestCardDetail(studentId: string): Promise<TestCardDetailDTO | null> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  if (!Types.ObjectId.isValid(studentId)) return null;
  const student = await UserModel.findOne({ _id: studentId, role: "student" }).lean();
  if (!student) return null;

  const results = await ResultModel.find({ userId: student._id }).sort({ submittedAt: -1 }).lean();
  const tests = await TestModel.find({ _id: { $in: results.map((r) => r.testId) } })
    .select("_id subject")
    .lean();
  const subjectByTest = new Map(tests.map((t) => [String(t._id), t.subject]));

  const rows: TestCardDetailDTO["rows"] = [];
  let pendingWritten = 0;

  const ranks = await ranksFor(results);
  for (const [i, r] of results.entries()) {
    const { rank, total } = ranks[i];
    if (!r.fullyGraded) pendingWritten++;
    rows.push({
      testId: String(r.testId),
      title: r.title,
      subject: subjectByTest.get(String(r.testId)) ?? "",
      date: fmtDate(r.submittedAt),
      marks: r.obtained,
      totalMarks: r.totalMarks,
      pct: r.totalMarks > 0 ? Math.round((r.obtained / r.totalMarks) * 1000) / 10 : 0,
      rank,
      totalStudents: total,
      passed: r.totalMarks > 0 && r.obtained / r.totalMarks >= 0.4,
      fullyGraded: r.fullyGraded,
    });
  }

  const completed = rows.length;
  const avgPct = completed ? Math.round((rows.reduce((s, x) => s + x.pct, 0) / completed) * 10) / 10 : 0;
  const bestRow = [...rows].sort((a, b) => b.pct - a.pct)[0];
  const bestRankRow = [...rows].sort((a, b) => a.rank - b.rank)[0];
  const passRate = completed
    ? Math.round((rows.filter((x) => x.passed).length / completed) * 100)
    : 0;
  const grade =
    completed === 0
      ? "—"
      : avgPct >= 90
        ? "A+"
        : avgPct >= 80
          ? "A"
          : avgPct >= 70
            ? "B+"
            : avgPct >= 60
              ? "B"
              : avgPct >= 50
                ? "C"
                : avgPct >= 40
                  ? "D"
                  : "F";
  const bestRank = bestRankRow?.rank ?? 0;
  const percentile =
    bestRankRow && bestRankRow.totalStudents > 0
      ? Math.round((((bestRankRow.totalStudents - bestRank) / bestRankRow.totalStudents) * 1000)) / 10
      : 0;

  return {
    student: {
      id: String(student._id),
      name: student.name,
      email: student.email,
      admissionNo: student.admissionNo ?? "-",
      rollNo: student.rollNo ?? "-",
      batch: student.batch ?? "-",
      course: student.course ?? null,
    },
    summary: {
      completed,
      avgPct,
      bestPct: bestRow?.pct ?? 0,
      bestRank,
      passRate,
      grade,
      percentile,
      pendingWritten,
    },
    rows,
  };
}

export type TestFormOption = {
  value: string;
  hint?: string;
};

export type TestFormContext = {
  batches: { name: string; studentCount: number; courses: string[] }[];
  courses: { name: string; studentCount: number }[];
  subjects: string[];
};

/**
 * Admin/staff: real options for the Create Test form — batches, courses and
 * subjects derived from live student data + past tests (so the autocomplete
 * dropdowns always match what actually exists).
 */
export async function getTestFormContext(): Promise<TestFormContext> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const [students, tests] = await Promise.all([
    UserModel.find({ role: "student" }).select("batch course").lean(),
    TestModel.find().select("batch course subject").lean(),
  ]);

  const batchMap = new Map<string, { studentCount: number; courses: Set<string> }>();
  const courseMap = new Map<string, number>();
  const subjectSet = new Set<string>();

  for (const s of students) {
    if (s.batch?.trim()) {
      const entry = batchMap.get(s.batch) ?? { studentCount: 0, courses: new Set<string>() };
      entry.studentCount++;
      if (s.course?.trim()) entry.courses.add(s.course);
      batchMap.set(s.batch, entry);
    }
    if (s.course?.trim()) courseMap.set(s.course, (courseMap.get(s.course) ?? 0) + 1);
  }
  for (const t of tests) {
    if (t.batch?.trim()) {
      const entry = batchMap.get(t.batch) ?? { studentCount: 0, courses: new Set<string>() };
      if (t.course?.trim()) entry.courses.add(t.course);
      batchMap.set(t.batch, entry);
    }
    if (t.course?.trim()) {
      if (!courseMap.has(t.course)) courseMap.set(t.course, 0);
    }
    if (t.subject?.trim()) subjectSet.add(t.subject);
  }

  const batches = [...batchMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, entry]) => ({ name, studentCount: entry.studentCount, courses: [...entry.courses].sort() }));

  const courses = [...courseMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, studentCount]) => ({ name, studentCount }));

  return { batches, courses, subjects: [...subjectSet].sort((a, b) => a.localeCompare(b)) };
}

export type CreateTestOutcome = {
  ok: boolean;
  testId?: string;
  title?: string;
  message?: string;
};

/** Admin/staff: validates + persists a new test along with its questions. */
export async function createTest(
  input: {
    title: string;
    subject: string;
    course: string;
    batch: string;
    description?: string;
    durationMinutes: number;
    passMarks: number;
    startAt: string;
    questions: {
      type: "mcq" | "written";
      text: string;
      marks: number;
      options?: string[];
      correctIndices?: number[];
    }[];
  },
): Promise<CreateTestOutcome> {
  const { user } = await requireRole(["admin", "staff"]);

  const parsed = CreateTestSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Invalid test data." };
  }

  const { startAt, questions } = parsed.data;
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, message: "Pick a valid start date and time." };
  }

  for (const q of questions) {
    if (q.type === "mcq") {
      const options = (q.options ?? []).filter((o) => o.trim().length > 0);
      if (options.length < 2) {
        return { ok: false, message: `MCQ "${q.text.slice(0, 40)}" needs at least 2 options.` };
      }
      const indices = [...new Set(q.correctIndices ?? [])].filter((i) => i < options.length);
      if (indices.length === 0) {
        return { ok: false, message: `Mark at least one correct option for "${q.text.slice(0, 40)}".` };
      }
    } else if ((q.options ?? []).some((o) => o.trim().length > 0)) {
      return { ok: false, message: "Written questions should not have options." };
    }
  }

  await connectDB();
  const session = await getSession();
  const createdBy = session?.user?.id ?? new Types.ObjectId();

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const endAt = new Date(start.getTime() + parsed.data.durationMinutes * 60 * 1000);
  const now = new Date();
  const status = now >= start && now <= endAt ? "active" : now > endAt ? "completed" : "upcoming";

  const test = await TestModel.create({
    title: parsed.data.title,
    subject: parsed.data.subject,
    course: parsed.data.course,
    batch: parsed.data.batch,
    description: parsed.data.description || "",
    durationMinutes: parsed.data.durationMinutes,
    totalMarks,
    passMarks: parsed.data.passMarks,
    startAt: start,
    endAt,
    status,
    createdBy,
  });

  await QuestionModel.deleteMany({ testId: test._id });
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const options = q.type === "mcq" ? (q.options ?? []).filter((o) => o.trim().length > 0).map((o) => o.trim()) : [];
    const correctIndices =
      q.type === "mcq"
        ? [...new Set(q.correctIndices ?? [])].filter((idx) => idx < options.length).sort((a, b) => a - b)
        : [];
    await QuestionModel.create({
      testId: test._id,
      type: q.type,
      text: q.text,
      options,
      correctIndices,
      marks: q.marks,
      order: i + 1,
    });
  }

  await writeAudit(user, "created test", parsed.data.title);
  return { ok: true, testId: String(test._id), title: parsed.data.title };
}