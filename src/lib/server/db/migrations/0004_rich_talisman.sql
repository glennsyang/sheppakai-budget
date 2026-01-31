ALTER TABLE `session` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `banned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `ban_expires` integer;