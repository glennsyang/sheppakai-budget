-- Add tracking columns to users table
ALTER TABLE `users` ADD `created_by` integer;
ALTER TABLE `users` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `users` ADD `updated_by` integer;

-- Add tracking columns to categories table
ALTER TABLE `categories` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `categories` ADD `created_by` integer;
ALTER TABLE `categories` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `categories` ADD `updated_by` integer;

-- Add tracking columns to expenses table
ALTER TABLE `expenses` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `expenses` ADD `created_by` integer;
ALTER TABLE `expenses` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `expenses` ADD `updated_by` integer;

-- Add tracking columns to income table
ALTER TABLE `income` ADD `created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `income` ADD `created_by` integer;
ALTER TABLE `income` ADD `updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL;
ALTER TABLE `income` ADD `updated_by` integer;
