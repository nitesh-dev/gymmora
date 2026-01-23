CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`type` text NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_plan_days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`day_of_week` integer NOT NULL,
	`day_label` text,
	`is_rest_day` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_plan_days`("id", "plan_id", "day_of_week", "day_label", "is_rest_day") SELECT "id", "plan_id", "day_of_week", "day_label", "is_rest_day" FROM `plan_days`;--> statement-breakpoint
DROP TABLE `plan_days`;--> statement-breakpoint
ALTER TABLE `__new_plan_days` RENAME TO `plan_days`;--> statement-breakpoint
PRAGMA foreign_keys=ON;