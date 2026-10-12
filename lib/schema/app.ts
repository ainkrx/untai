import { defineRelationsPart } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const category = pgEnum("category", [
  "Outerwear",
  "Tops",
  "Dress",
  "Skirt",
  "Pants",
  "Hats",
  "Scarves",
  "Gloves",
  "Socks",
  "Keychain",
  "Amigurumi",
  "Blankets",
  "Home decor",
  "Others",
]);
export const difficulty = pgEnum("difficulty", ["Beginner", "Easy", "Intermediate", "Advanced"]);
export const patternStatus = pgEnum("pattern_status", ["private", "in_review", "public"]);
export const reportTarget = pgEnum("report_target", ["pattern", "recreate"]);
export const reportReason = pgEnum("report_reason", ["Inappropriate content", "Spam", "Other"]);

// updated_at has no $onUpdate: it changes only when the author saves an edit.
export const pattern = pgTable(
  "pattern",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    images: text("images").array().notNull(),
    category: category("category").notNull(),
    tags: text("tags").array().notNull(),
    difficulty: difficulty("difficulty").notNull(),
    status: patternStatus("status").notNull().default("private"),
    adminReason: text("admin_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
  },
  (t) => [
    index("pattern_author_id_idx").on(t.authorId),
  ],
);

export const patternStep = pgTable(
  "pattern_step",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patternId: uuid("pattern_id").notNull().references(() => pattern.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    description: text("description").notNull(),
    images: text("images").array().notNull().default([]),
  },
  (t) => [
    index("pattern_step_pattern_id_idx").on(t.patternId),
  ],
);

export const recreate = pgTable(
  "recreate",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patternId: uuid("pattern_id").notNull().references(() => pattern.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    images: text("images").array().notNull(),
    caption: text("caption").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("recreate_pattern_author_idx").on(t.patternId, t.authorId),
    index("recreate_author_id_idx").on(t.authorId),
  ],
);

// target_id has no foreign key because it points to either a pattern or a recreate.
export const report = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetType: reportTarget("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reporterId: text("reporter_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    reason: reportReason("reason").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("report_one_per_target_idx").on(t.reporterId, t.targetType, t.targetId),
    index("report_target_idx").on(t.targetType, t.targetId),
  ],
);

export const stepProgress = pgTable(
  "step_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    patternId: uuid("pattern_id").notNull().references(() => pattern.id, { onDelete: "cascade" }),
    stepId: uuid("step_id").notNull().references(() => patternStep.id, { onDelete: "cascade" }),
    checkedAt: timestamp("checked_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("step_progress_user_step_idx").on(t.userId, t.stepId),
    index("step_progress_user_pattern_idx").on(t.userId, t.patternId),
  ],
);

export const patternCounter = pgTable(
  "pattern_counter",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    patternId: uuid("pattern_id").notNull().references(() => pattern.id, { onDelete: "cascade" }),
    rowCount: integer("row_count").notNull().default(0),
    stitchCount: integer("stitch_count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("pattern_counter_user_pattern_idx").on(t.userId, t.patternId),
  ],
);

// `user` is also in authRelations, so lib/db.ts merges the two `user` entries
export const appRelations = defineRelationsPart(
  { user, pattern, patternStep, recreate, report, stepProgress, patternCounter },
  (r) => ({
    user: {
      patterns: r.many.pattern({ from: r.user.id, to: r.pattern.authorId }),
      recreates: r.many.recreate({ from: r.user.id, to: r.recreate.authorId }),
      reports: r.many.report({ from: r.user.id, to: r.report.reporterId }),
      stepProgress: r.many.stepProgress({ from: r.user.id, to: r.stepProgress.userId }),
      patternCounters: r.many.patternCounter({ from: r.user.id, to: r.patternCounter.userId }),
    },
    pattern: {
      author: r.one.user({ from: r.pattern.authorId, to: r.user.id }),
      steps: r.many.patternStep({ from: r.pattern.id, to: r.patternStep.patternId }),
      recreates: r.many.recreate({ from: r.pattern.id, to: r.recreate.patternId }),
      stepProgress: r.many.stepProgress({ from: r.pattern.id, to: r.stepProgress.patternId }),
      patternCounters: r.many.patternCounter({ from: r.pattern.id, to: r.patternCounter.patternId }),
    },
    patternStep: {
      pattern: r.one.pattern({ from: r.patternStep.patternId, to: r.pattern.id }),
      stepProgress: r.many.stepProgress({ from: r.patternStep.id, to: r.stepProgress.stepId }),
    },
    recreate: {
      pattern: r.one.pattern({ from: r.recreate.patternId, to: r.pattern.id }),
      author: r.one.user({ from: r.recreate.authorId, to: r.user.id }),
    },
    report: {
      reporter: r.one.user({ from: r.report.reporterId, to: r.user.id }),
    },
    stepProgress: {
      user: r.one.user({ from: r.stepProgress.userId, to: r.user.id }),
      pattern: r.one.pattern({ from: r.stepProgress.patternId, to: r.pattern.id }),
      step: r.one.patternStep({ from: r.stepProgress.stepId, to: r.patternStep.id }),
    },
    patternCounter: {
      user: r.one.user({ from: r.patternCounter.userId, to: r.user.id }),
      pattern: r.one.pattern({ from: r.patternCounter.patternId, to: r.pattern.id }),
    },
  }),
);
