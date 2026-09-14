import {
	ADMIN_USER_IDS,
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
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { createAuthAfterHooks, logPasswordResetAudit } from './auth-audit-hooks';
import { buildResetUrl } from './auth-reset-url';
import { getDb } from './db';
import * as schema from './db/schema';
import { sendPasswordChangedEmail, sendPasswordResetEmail, sendVerificationEmail } from './email';
import { sendAuthAlerts } from './notifications';

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
	user: {
		additionalFields: {
			name: {
				type: 'string',
				// The `users.name` column is NOT NULL (matches synapse/mealplanner).
				// Registration already enforces a name via registerSchema before signUpEmail.
				required: true
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true,
		minPasswordLength: 12,
		maxPasswordLength: 128,
		revokeSessionsOnPasswordReset: true,
		resetPasswordTokenExpiresIn: 60 * 10, // 10 minutes
		sendResetPassword: async ({ user, url, token }) => {
			// Extract and validate callbackURL before building reset link
			const urlObj = new URL(url);
			const callbackURL = urlObj.searchParams.get('callbackURL');
			if (!callbackURL) {
				throw new Error('Missing callbackURL parameter');
			}
			const resetUrl = buildResetUrl(callbackURL, token);
			void sendPasswordResetEmail(user.email, user.name, resetUrl);
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
		before: createAuthMiddleware(async (ctx) => {
			// Real endpoint paths are `/sign-up/email` and `/sign-in/email` — the
			// app's own `/register`/`/sign-in` SvelteKit routes never appear here
			// (see createAuthAfterHooks in ./auth-audit-hooks.ts for the same note).
			if (!ctx.path.includes('/sign-up/email') && !ctx.path.includes('/sign-in/email')) {
				return;
			}
			if (!ctx.body?.email.includes('sheppard')) {
				void sendAuthAlerts(
					`⚠️ Registration/sign-in attempt with invalid email: ${ctx.body?.email} at ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} UTC.`,
					'Sheppakai-Budget - Security Alert',
					4
				);
				throw new APIError('BAD_REQUEST', {
					message: 'Email must include "sheppard" for registration'
				});
			}
			// Password strength validation on registration
			if (ctx.path.includes('/sign-up/email') && ctx.body?.password) {
				const password = ctx.body.password;
				const hasUpperCase = /[A-Z]/.test(password);
				const hasLowerCase = /[a-z]/.test(password);
				const hasNumbers = /\d/.test(password);
				const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
				if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
					throw new APIError('BAD_REQUEST', {
						message: 'Password must contain uppercase, lowercase, numbers, and special characters'
					});
				}
			}
		}),
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
			maxAge: 60 * 5 // 5 minutes client-side cache
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

	const isHardcodedAdmin = ADMIN_USER_IDS.split(',').includes(locals.user.id);
	const isRoleAdmin = locals.user.role === 'admin';

	if (!isHardcodedAdmin && !isRoleAdmin) {
		throw error(403, 'Forbidden');
	}
}
