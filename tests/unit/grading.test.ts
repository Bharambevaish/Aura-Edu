import { describe, expect, it } from "vitest";
import { applyWrittenGrades, buildGradedAnswers, rankAmong, sumWrittenScore } from "@/lib/services/tests";

const mcq = (id: string, correct: number[], marks = 4) => ({ _id: id, type: "mcq", correctIndices: correct, marks });
const written = (id: string, marks = 10) => ({ _id: id, type: "written", correctIndices: [], marks });
const answers = (entries: [string, { selectedIndices?: number[]; answerText?: string }][]) => new Map(entries);

describe("buildGradedAnswers — MCQ", () => {
  it("awards marks only for the exact set of correct options", () => {
    const qs = [mcq("a", [1]), mcq("b", [0, 2]), mcq("c", [0, 2]), mcq("d", [3])];
    const { mcqScore } = buildGradedAnswers(
      qs,
      answers([
        ["a", { selectedIndices: [1] }], // correct
        ["b", { selectedIndices: [2, 0] }], // correct, any order
        ["c", { selectedIndices: [0] }], // partial: no marks
        ["d", { selectedIndices: [3, 1] }], // extra option: no marks
      ]),
    );
    expect(mcqScore).toBe(8);
  });

  it("ignores duplicate selections and unanswered questions", () => {
    const { mcqScore, rebuilt } = buildGradedAnswers([mcq("a", [1]), mcq("b", [2])], answers([["a", { selectedIndices: [1, 1] }]]));
    expect(mcqScore).toBe(4);
    expect(rebuilt[1]).toMatchObject({ isCorrect: false, awardedMarks: 0, graded: true });
  });

  it("never awards a question with no answer key", () => {
    const { mcqScore } = buildGradedAnswers([mcq("a", [])], answers([["a", { selectedIndices: [] }]]));
    expect(mcqScore).toBe(0);
  });
});

describe("buildGradedAnswers — written", () => {
  it("keeps an answered written question pending for a teacher", () => {
    const { pendingWritten, rebuilt } = buildGradedAnswers([written("w")], answers([["w", { answerText: "  Newton's second law  " }]]));
    expect(pendingWritten).toBe(1);
    expect(rebuilt[0]).toMatchObject({ answerText: "Newton's second law", awardedMarks: null, graded: false });
  });

  it("scores a blank written answer 0 straight away", () => {
    const { pendingWritten, rebuilt } = buildGradedAnswers([written("w"), written("x")], answers([["w", { answerText: "   " }]]));
    expect(pendingWritten).toBe(0);
    expect(rebuilt).toEqual([
      expect.objectContaining({ answerText: null, awardedMarks: 0, graded: true }),
      expect.objectContaining({ answerText: null, awardedMarks: 0, graded: true }),
    ]);
  });
});

describe("applyWrittenGrades", () => {
  const attempt = [
    { questionId: "m", type: "mcq", graded: true, awardedMarks: 4 },
    { questionId: "w1", type: "written", graded: false, awardedMarks: null },
    { questionId: "w2", type: "written", graded: false, awardedMarks: null },
  ];
  const max = new Map([
    ["w1", 10],
    ["w2", 5],
  ]);

  it("caps marks at the question maximum and floors them at 0", () => {
    const { writtenScore, remainingWritten } = applyWrittenGrades(attempt, new Map([["w1", 50], ["w2", -3]]), max);
    expect(writtenScore).toBe(10);
    expect(remainingWritten).toBe(0);
  });

  it("leaves ungraded answers pending and ignores unknown or MCQ ids", () => {
    const { rebuilt, writtenScore, remainingWritten } = applyWrittenGrades(attempt, new Map([["w1", 7], ["m", 100], ["zz", 3]]), max);
    expect(writtenScore).toBe(7);
    expect(remainingWritten).toBe(1);
    expect(rebuilt[0]).toBe(attempt[0]);
  });

  it("sumWrittenScore only counts graded written answers", () => {
    expect(
      sumWrittenScore([
        { type: "written", graded: true, awardedMarks: 6 },
        { type: "written", graded: false, awardedMarks: 9 },
        { type: "mcq", graded: true, awardedMarks: 4 },
      ]),
    ).toBe(6);
  });
});

describe("rankAmong", () => {
  it("ranks by score with ties sharing a rank", () => {
    const scores = [40, 35, 35, 20];
    expect(rankAmong(40, scores)).toEqual({ rank: 1, total: 4 });
    expect(rankAmong(35, scores)).toEqual({ rank: 2, total: 4 });
    expect(rankAmong(20, scores)).toEqual({ rank: 4, total: 4 });
  });
});
