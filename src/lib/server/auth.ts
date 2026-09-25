import {
	ADMIN_USER_IDS,
	ALLOWED_EMAILS,
	BETTER_AUTH_BASE_URL,
	BETTER_AUTH_SECRET,
	NODE_ENV
} from '$app/env/private';
import { getRequestEvent } from '$app/server';
import { logger } from '$lib/server/logger';
import { apiKey } from '@better-auth/api-key';
import { error } from '@sveltejs/kit';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, haveIBeenPwned } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { isAdminUser } from './admin-status';
import { createAllowlistBeforeHook, parseAllowedEmails } from './auth-allowlist-hook';
import { createAuthAfterHooks, logPasswordResetAudit } from './auth-audit-hooks';
import { getDb } from './db';
import * as schema from './db/schema';
import { sendPasswordChangedEmail, sendPasswordResetEmail, sendVerificationEmail } from './email';

export const auth = betterAuth({
	appName: 'Sheppakai Budget',
	secret: BETTER_AUTH_SECRET,
	baseURL: BETTER_AUTH_BASE_URL,
	database: drizzleAdapter(getDb(), {
		provider: 'sqlite',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
			apikey: schema.apiKey,
			// Required because rateLimit.storage is 'database' in production (see the
			// rateLimit config below). Without this mapping better-auth has nowhere to
			// persist per-IP counters and DB-backed rate limiting silently no-ops.
			rateLimit: schema.rateLimit
		}
	}),
	emailAndPassword: {
		enabled: true,
		// Accounts are created by an admin only (scripts/create-user.ts).
		disableSignUp: true,
		autoSignIn: false,
		requireEmailVerification: true,
		minPasswordLength: 12,
		maxPasswordLength: 128,
		revokeSessionsOnPasswordReset: true,
		resetPasswordTokenExpiresIn: 60 * 10, // 10 minutes
		sendResetPassword: async ({ user, url }) => {
			// `url` is Better Auth's own GET-verifier link
			// (/api/auth/reset-password/<token>?callbackURL=...). Pass it straight
			// through — its own originCheck middleware already validated
			// callbackURL against trustedOrigins, and the verifier itself checks
			// the token before redirecting to /reset-password.
			void sendPasswordResetEmail(user.email, user.name, url);
		},
		onPasswordReset: async ({ user }) => {
			logPasswordResetAudit(user, 'Sheppakai Budget');
			void sendPasswordChangedEmail({
				to: user.email,
				name: user.name,
				changedAt: new Date(),
				source: 'Password reset flow'
			});
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }) => {
			logger.debug('✉️ Email verification sent');
			const verifyUrl = `${url}?token=${token}`;
			void sendVerificationEmail(user.email, user.name, verifyUrl);
		}
	},
	hooks: {
		// Public sign-up is off (disableSignUp above); this also restricts sign-in to
		// the exact ALLOWED_EMAILS list.
		before: createAllowlistBeforeHook('Sheppakai Budget', parseAllowedEmails(ALLOWED_EMAILS)),
		after: createAuthAfterHooks('Sheppakai Budget')
	},
	advanced: {
		cookiePrefix: 'sheppakai_budget',
		useSecureCookies: true,
		ipAddress: {
			// Enable IP address and user agent tracking
			disableIpTracking: false,
			ipAddressHeaders: ['fly-client-ip', 'x-forwarded-for', 'x-real-ip', 'x-client-ip']
		},
		database: {
			generateId: () => crypto.randomUUID()
		}
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Update every 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 60 // 1 minute — caps how long a ban or session revocation can lag behind the DB
		}
	},
	trustedOrigins: [
		new URL(BETTER_AUTH_BASE_URL).origin,
		...(NODE_ENV === 'development' ? ['http://localhost:5173'] : [])
	],
	rateLimit: {
		enabled: true,
		window: 60, // 1 minute
		max: 5, // max 5 requests per window per IP
		storage: NODE_ENV === 'production' ? 'database' : 'memory'
	},
	plugins: [
		admin({
			adminUserIds: ADMIN_USER_IDS.split(','),
			// Plugin defaults, spelled out for parity with the sibling repos.
			defaultRole: 'user',
			adminRoles: ['admin']
		}),
		// NIST SP 800-63B §5.1.1.2: reject passwords found in a known-breach corpus.
		// Checked via the HIBP k-anonymity range API on the plugin's default paths
		// (/sign-up/email, /change-password, /reset-password, /admin/set-user-password)
		// — only the first 5 hex chars of the password's SHA-1 hash ever leave the
		// server. Fails closed: an HIBP outage blocks the password change rather than
		// silently skipping the check.
		haveIBeenPwned(),
		apiKey({
			references: 'user',
			storage: 'database',
			requireName: true,
			// Only ever verified explicitly via auth.api.verifyApiKey (see src/lib/server/api/require-api-key.ts).
			// Never let a valid API key stand in for a session on the app's own cookie-based routes.
			enableSessionForAPIKeys: false,
			keyExpiration: {
				minExpiresIn: 1,
				maxExpiresIn: 365
			},
			rateLimit: {
				enabled: true,
				timeWindow: 60 * 1000, // 1 minute
				maxRequests: 100
			}
		}),
		sveltekitCookies(getRequestEvent)
	] // make sure this is the last plugin in the array
});

/**
 * Assert the current user is an admin, throwing a SvelteKit `error(401|403)` otherwise.
 *
 * This is sheppakai-budget's superforms-aware extension of the canonical admin guard: it
 * additionally honours the `ADMIN_USER_IDS` env bootstrap (grant admin by id without a DB
 * write), on top of the `role === 'admin'` check that `requireAdmin` in
 * `./actions/auth-guard` performs in every repo. Use it directly in
 * `+layout.server.ts` / `+page.server.ts` load functions; for actions that need to attach the
 * failure to a superforms message, use `adminAuthFailure` from `./actions/admin-guard`.
 *
 * @param locals - SvelteKit locals object containing user data
 * @throws {HttpError} 401 when unauthenticated, 403 when authenticated but not an admin
 */
export function assertAdmin(locals: App.Locals): void {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	if (!isAdminUser(locals.user)) {
		throw error(403, 'Forbidden');
	}
}
