CREATE TABLE `contributions` (
	`id` text PRIMARY KEY NOT NULL,
	`goal_id` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`description` text,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `savings_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `savings_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`target_amount` real NOT NULL,
	`target_date` text,
	`status` text DEFAULT 'active' NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
