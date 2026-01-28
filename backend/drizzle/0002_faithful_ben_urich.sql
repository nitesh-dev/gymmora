ALTER TABLE "exercises" ADD COLUMN "muscle_groups" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "equipment" text[];--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "muscles_worked" jsonb;