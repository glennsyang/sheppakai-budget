import { ADMIN_USER_IDS } from '$app/env/private';

type RoleFields = { id: string; role?: string | null };
type BanFields = { banned?: boolean | null; banExpires?: Date | null };

/**
 * Whether a user holds admin rights: either listed in the `ADMIN_USER_IDS` env bootstrap
 * or carrying `role === 'admin'`. The same rule the better-auth `admin` plugin applies
 * (`adminUserIds` + `adminRoles` in `./auth.ts`), kept in one place so `assertAdmin`,
 * API-key verification and the demote-disables-keys path can't drift apart.
 */
export function isAdminUser(user: RoleFields): boolean {
	return ADMIN_USER_IDS.split(',').includes(user.id) || user.role === 'admin';
}

/**
 * Whether a ban is currently in force. Mirrors the better-auth `admin` plugin: a ban with
 * a `banExpires` in the past is treated as lifted (the plugin clears the flag lazily, on
 * the user's next sign-in, so the row can still read `banned: true` until then).
 */
export function isBanActive(user: BanFields, now: Date = new Date()): boolean {
	if (!user.banned) return false;
	return !user.banExpires || user.banExpires.getTime() > now.getTime();
}
