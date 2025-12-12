PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_income` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`date` text DEFAULT '' NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_by` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_income`("id", "description", "amount", "user_id", "created_at", "created_by", "updated_at", "updated_by") SELECT "id", "description", "amount", "user_id", "created_at", "created_by", "updated_at", "updated_by" FROM `income`;--> statement-breakpoint
DROP TABLE `income`;--> statement-breakpoint
ALTER TABLE `__new_income` RENAME TO `income`;--> statement-breakpoint
PRAGMA foreign_keys=ON;