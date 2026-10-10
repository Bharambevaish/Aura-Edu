/**
 * Courses — shared constants for the Course Content + Course Center module.
 *
 * Lives outside the "use server" file (which may only export async functions)
 * so both server actions and client pages can import these synchronously.
 */
export type CourseCategory = "Medical Entrance" | "Engineering Entrance" | "Computer Science";

export const COURSE_CATEGORIES: CourseCategory[] = [
  "Medical Entrance",
  "Engineering Entrance",
  "Computer Science",
];

export type LessonType = "video" | "document" | "quiz";

export const LESSON_TYPES: { value: LessonType; label: string }[] = [
  { value: "video", label: "Video Lecture" },
  { value: "document", label: "PDF Notes" },
  { value: "quiz", label: "Quiz / Test" },
];

export function isLessonType(value: string | null | undefined): value is LessonType {
  return value === "video" || value === "document" || value === "quiz";
}

export function isCourseCategory(value: string | null | undefined): value is CourseCategory {
  return value === "Medical Entrance" || value === "Engineering Entrance" || value === "Computer Science";
}