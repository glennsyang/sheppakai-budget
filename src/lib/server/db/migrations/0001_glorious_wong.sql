CREATE TABLE `budget` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` real NOT NULL,
	`month` text NOT NULL,
	`year` text NOT NULL,
	`category_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
