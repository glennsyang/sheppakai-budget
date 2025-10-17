-- Step 1: Add new columns as nullable first
ALTER TABLE `expenses` ADD `payee` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `notes` text;--> statement-breakpoint

-- Step 2: Copy data from description to notes
UPDATE `expenses` SET `notes` = `description`, `payee` = 'Unknown' WHERE `notes` IS NULL;--> statement-breakpoint

-- Step 3: Drop old column
ALTER TABLE `expenses` DROP COLUMN `description`;