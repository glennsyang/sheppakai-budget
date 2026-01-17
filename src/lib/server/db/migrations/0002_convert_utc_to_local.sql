-- Migration: Convert UTC timestamps to local timezone (PST)
-- Description: Updates all user-facing date fields from UTC to local timezone by subtracting 8 hours.
--              Audit fields (created_at, updated_at) remain in UTC for system consistency.
-- Date: 2026-01-16

-- Update transactions table
UPDATE `transactions` 
SET `date` = datetime(`date`, '-8 hours')
WHERE `date` IS NOT NULL;
--> statement-breakpoint

-- Update income table
UPDATE `income` 
SET `date` = datetime(`date`, '-8 hours')
WHERE `date` IS NOT NULL;
--> statement-breakpoint

-- Update contributions table
UPDATE `contributions` 
SET `date` = datetime(`date`, '-8 hours')
WHERE `date` IS NOT NULL;
--> statement-breakpoint

-- Update savings_goals table (only target_date field)
UPDATE `savings_goals` 
SET `target_date` = datetime(`target_date`, '-8 hours')
WHERE `target_date` IS NOT NULL;
