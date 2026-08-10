-- Add submissionType and submissionOptions to tasks
ALTER TABLE "tasks" ADD COLUMN "submission_type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "tasks" ADD COLUMN "submission_options" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Add submissionType to submissions
ALTER TABLE "submissions" ADD COLUMN "submission_type" TEXT NOT NULL DEFAULT 'text';
