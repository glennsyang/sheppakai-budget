-- Migration: One-time backfill marking pre-existing users as email-verified
-- Description: requireEmailVerification is now enforced at sign-in. Only 2 users
--              exist in production; back-date them as verified so this gate doesn't
--              lock out accounts created before enforcement. Users created after this
--              migration runs are NOT touched — they must verify normally.
-- Date: 2026-08-28

UPDATE `users` SET `email_verified` = 1 WHERE `email_verified` = 0;
