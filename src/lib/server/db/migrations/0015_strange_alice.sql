-- Backfill: any existing user with no name falls back to their email so the
-- NOT NULL rebuild below succeeds. Registration has always required a name
-- (registerSchema, min 2 chars), so in practice this touches nothing.
UPDATE `users` SET `name` = `email` WHERE `name` IS NULL OR `name` = '';--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "email_verified", "name", "image", "role", "banned", "ban_reason", "ban_expires", "created_at", "updated_at") SELECT "id", "email", "email_verified", "name", "image", "role", "banned", "ban_reason", "ban_expires", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);