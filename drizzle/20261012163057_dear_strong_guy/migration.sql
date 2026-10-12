CREATE TYPE "category" AS ENUM('Outerwear', 'Tops', 'Dress', 'Skirt', 'Pants', 'Hats', 'Scarves', 'Gloves', 'Socks', 'Keychain', 'Amigurumi', 'Blankets', 'Home decor', 'Others');--> statement-breakpoint
CREATE TYPE "difficulty" AS ENUM('Beginner', 'Easy', 'Intermediate', 'Advanced');--> statement-breakpoint
CREATE TYPE "pattern_status" AS ENUM('private', 'in_review', 'public');--> statement-breakpoint
CREATE TYPE "report_reason" AS ENUM('Inappropriate content', 'Spam', 'Other');--> statement-breakpoint
CREATE TYPE "report_target" AS ENUM('pattern', 'recreate');--> statement-breakpoint
CREATE TABLE "pattern" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"images" text[] NOT NULL,
	"category" "category" NOT NULL,
	"tags" text[] NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"status" "pattern_status" DEFAULT 'private'::"pattern_status" NOT NULL,
	"admin_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pattern_counter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"pattern_id" uuid NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"stitch_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"pattern_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"description" text NOT NULL,
	"images" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recreate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"pattern_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"rating" integer NOT NULL,
	"images" text[] NOT NULL,
	"caption" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"target_type" "report_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" "report_reason" NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "step_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"pattern_id" uuid NOT NULL,
	"step_id" uuid NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "pattern_author_id_idx" ON "pattern" ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pattern_counter_user_pattern_idx" ON "pattern_counter" ("user_id","pattern_id");--> statement-breakpoint
CREATE INDEX "pattern_step_pattern_id_idx" ON "pattern_step" ("pattern_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recreate_pattern_author_idx" ON "recreate" ("pattern_id","author_id");--> statement-breakpoint
CREATE INDEX "recreate_author_id_idx" ON "recreate" ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "report_one_per_target_idx" ON "report" ("reporter_id","target_type","target_id");--> statement-breakpoint
CREATE INDEX "report_target_idx" ON "report" ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "step_progress_user_step_idx" ON "step_progress" ("user_id","step_id");--> statement-breakpoint
CREATE INDEX "step_progress_user_pattern_idx" ON "step_progress" ("user_id","pattern_id");--> statement-breakpoint
ALTER TABLE "pattern" ADD CONSTRAINT "pattern_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pattern_counter" ADD CONSTRAINT "pattern_counter_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pattern_counter" ADD CONSTRAINT "pattern_counter_pattern_id_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "pattern"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pattern_step" ADD CONSTRAINT "pattern_step_pattern_id_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "pattern"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recreate" ADD CONSTRAINT "recreate_pattern_id_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "pattern"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recreate" ADD CONSTRAINT "recreate_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_pattern_id_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "pattern"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "step_progress" ADD CONSTRAINT "step_progress_step_id_pattern_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "pattern_step"("id") ON DELETE CASCADE;