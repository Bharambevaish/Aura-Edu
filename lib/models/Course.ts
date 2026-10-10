import mongoose from "mongoose";

/**
 * A course — the single entity driving both the admin Course Content tab
 * (curriculum tree: modules → lessons) and the Course Center tab (storefront
 * settings: published/paid/price/badge). One course, two admin views.
 *
 * `enrolledStudents` holds the ObjectIds of students currently in the course.
 * It is a demo-friendly count source for the Center tab (enrolments + revenue);
 * the real source of a student's course string stays `User.course`.
 */
export interface CourseLesson {
  id: string;
  title: string;
  type: "video" | "document" | "quiz";
  /** Asset reference — a video URL, PDF link or test target. Demo content is URL-based. */
  url: string;
  duration: string;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseDoc {
  title: string;
  code: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  published: boolean;
  isPaid: boolean;
  price: number;
  originalPrice: number;
  level: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  features: string[];
  modules: CourseModule[];
  enrolledStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new mongoose.Schema<CourseLesson>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["video", "document", "quiz"], required: true, default: "video" },
    url: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { _id: false },
);

const moduleSchema = new mongoose.Schema<CourseModule>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    lessons: { type: [lessonSchema], default: [] },
  },
  { _id: false },
);

const courseSchema = new mongoose.Schema<CourseDoc>(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    instructor: { type: String, default: "" },
    duration: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    published: { type: Boolean, default: false },
    isPaid: { type: Boolean, default: true },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    level: { type: String, default: "" },
    badge: { type: String, default: "" },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    modules: { type: [moduleSchema], default: [] },
    enrolledStudents: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true },
);

export const CourseModel =
  (mongoose.models.Course as mongoose.Model<CourseDoc>) ??
  mongoose.model<CourseDoc>("Course", courseSchema);