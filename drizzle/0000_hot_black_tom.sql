CREATE TABLE `todo_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`is_completed` integer DEFAULT false,
	`due_date` text,
	`priority` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`life_expectancy_years` integer NOT NULL,
	`gender` text,
	`created_at` integer,
	`updated_at` integer
);
