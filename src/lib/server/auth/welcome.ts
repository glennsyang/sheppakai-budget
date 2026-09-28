import { randomBytes } from 'node:crypto';

import { ALLOWED_EMAILS, BETTER_AUTH_BASE_URL } from '$app/env/private';
import { RESET_PASSWORD_ROUTE, SIGN_IN_ROUTE } from '$lib/auth-routes';

import { auth } from '../auth';
import { buildAllowlistCommand, parseAllowedEmails } from '../auth-allowlist-hook';
import { sendWelcomeEmail } from '../email';

const FLY_APP = 'sheppakai-budget';

// Far longer than the 10-minute reset link: a welcome email may sit unread for a day or two.
const WELCOME_LINK_TTL_MS = 72 * 60 * 60 * 1000;

export function isEmailAllowlisted(email: string): boolean {
	return parseAllowedEmails(ALLOWED_EMAILS).has(email.trim().toLowerCase());
}

export function allowlistCommandFor(email: string): string {
	return buildAllowlistCommand(ALLOWED_EMAILS, email, FLY_APP);
}

/**
 * Mints a set-password link for a newly created user. It is a standard Better Auth
 * reset-password token (same `reset-password:<token>` verification row that
 * `requestPasswordReset` writes), so it goes through Better Auth's own GET verifier and the
 * existing `/reset-password` page — only the expiry differs.
 */
async function createWelcomePasswordLink(userId: string): Promise<string> {
	const token = randomBytes(24).toString('base64url');
	const ctx = await auth.$context;
	await ctx.internalAdapter.createVerificationValue({
		identifier: `reset-password:${token}`,
		value: userId,
		expiresAt: new Date(Date.now() + WELCOME_LINK_TTL_MS)
	});
	return `${BETTER_AUTH_BASE_URL}/api/auth/reset-password/${token}?callbackURL=${encodeURIComponent(RESET_PASSWORD_ROUTE)}`;
}

/** Mints a fresh set-password link and sends the welcome email. Throws if the send fails. */
export async function sendWelcome(user: { id: string; email: string; name: string }) {
	const setPasswordUrl = await createWelcomePasswordLink(user.id);
	await sendWelcomeEmail({
		to: user.email,
		name: user.name,
		setPasswordUrl,
		signInUrl: `${BETTER_AUTH_BASE_URL}${SIGN_IN_ROUTE}`
	});
}
