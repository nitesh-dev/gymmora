CREATE TABLE `plan_weeks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`week_number` integer NOT NULL,
	`label` text,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_plan_days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_id` integer NOT NULL,
	`day_of_week` integer NOT NULL,
	`day_label` text,
	`is_rest_day` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`week_id`) REFERENCES `plan_weeks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_plan_days`("id", "week_id", "day_of_week", "day_label", "is_rest_day") SELECT "id", "week_id", "day_of_week", "day_label", "is_rest_day" FROM `plan_days`;--> statement-breakpoint
DROP TABLE `plan_days`;--> statement-breakpoint
ALTER TABLE `__new_plan_days` RENAME TO `plan_days`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `workout_plans` ADD `current_week` integer DEFAULT 1 NOT NULL;