import { APIError, createAuthMiddleware } from 'better-auth/api';

import { sendAuthAlerts } from './notifications';

const GUARDED_PATHS = new Set(['/sign-up/email', '/sign-in/email']);

/**
 * Parse the comma-separated `ALLOWED_EMAILS` env value into a normalised set.
 * Matching is exact after trim + lowercase — never a substring match.
 */
export function parseAllowedEmails(raw: string): Set<string> {
	return new Set(
		raw
			.split(',')
			.map((email) => email.trim().toLowerCase())
			.filter(Boolean)
	);
}

/**
 * `hooks.before` gate for Better Auth: only emails in `allowedEmails` may reach
 * `/sign-in/email` (or `/sign-up/email`, which is also disabled outright via
 * `emailAndPassword.disableSignUp`). Anything else is rejected with a generic
 * message and raises an auth alert.
 */
export function createAllowlistBeforeHook(appName: string, allowedEmails: Set<string>) {
	return createAuthMiddleware(async (ctx) => {
		if (!GUARDED_PATHS.has(ctx.path)) {
			return;
		}
		const email = typeof ctx.body?.email === 'string' ? ctx.body.email.trim().toLowerCase() : '';
		if (email && allowedEmails.has(email)) {
			return;
		}
		void sendAuthAlerts(
			`⚠️ Blocked ${ctx.path} attempt for non-allowlisted email: ${email || '(none)'} at ${new Date().toISOString()}.`,
			`${appName} - Security Alert`,
			4
		);
		throw new APIError('FORBIDDEN', { message: 'Invalid email or password' });
	});
}

/**
 * The exact `fly secrets set` command that adds `email` to the allowlist, keeping every
 * existing entry. Admin-created users can't sign in until this has been run, because the
 * app can't change a Fly secret at runtime.
 */
export function buildAllowlistCommand(rawAllowedEmails: string, email: string, flyApp: string) {
	const emails = [...parseAllowedEmails(rawAllowedEmails), email.trim().toLowerCase()];
	return `fly secrets set ALLOWED_EMAILS="${[...new Set(emails)].join(',')}" -a ${flyApp}`;
}
