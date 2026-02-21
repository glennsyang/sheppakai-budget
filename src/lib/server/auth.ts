import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { admin } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

import { getRequestEvent } from '$app/server';
import { logger } from '$lib/server/logger';

import { getEnv } from '../../env';

import * as schema from './db/schema';
import { getDb } from './db';
import { sendNewUserEmail, sendPasswordResetEmail, sendVerificationEmail } from './email';

const env = getEnv();

/**
 * Hardcoded admin user IDs. Used both in the admin plugin config and requireAdmin().
 */
const ADMIN_USER_IDS = ['kjpZ7oDLSr5JnB8B0w1Q5d8B16YbjrZb'];

export const auth = betterAuth({
	appName: 'Sheppakai Budget',
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(getDb(), {
		provider: 'sqlite',
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification
		}
	}),
	user: {
		additionalFields: {
			name: {
				type: 'string',
				required: false
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		minPasswordLength: 12,
		maxPasswordLength: 128,
		resetPasswordTokenExpiresIn: 60 * 10, // 10 minutes
		sendResetPassword: async ({ user, url, token }) => {
			// Construct the reset URL with token
			const urlObj = new URL(url, 'http://localhost'); // Need a base for relative URLs
			const callbackURL = urlObj.searchParams.get('callbackURL');
			if (!callbackURL) {
				throw new Error('Missing callbackURL parameter');
			}
			const resetUrl = `${callbackURL}?token=${token}`;
			void sendPasswordResetEmail(user.email, user.name || user.email, resetUrl);
		},
		onPasswordReset: async ({ user }) => {
			logger.debug('🔐 Password reset completed for user:', user.email);
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }) => {
			logger.debug('✉️ Email verification sent');
			const verifyUrl = `${url}?token=${token}`;
			void sendVerificationEmail(user.email, user.name || user.email, verifyUrl);
		}
	},
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (!ctx.path.includes('/register') && !ctx.path.includes('/sign-in')) {
				return;
			}
			if (!ctx.body?.email.includes('sheppard')) {
				throw new APIError('BAD_REQUEST', {
					message: 'Email must include "sheppard" for registration'
				});
			}
			// Password strength validation on registration
			if (ctx.path.includes('/register') && ctx.body?.password) {
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
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.includes('/register')) {
				const newSession = ctx.context.newSession;
				if (newSession) {
					logger.debug('✉️  New user email sent');
					void sendNewUserEmail(
						newSession.user.email,
						newSession.user.name || newSession.user.email,
						newSession.user.email
					);
				}
			}
			// Audit logging
			if (ctx.path.includes('/sign-in')) {
				logger.debug(
					`✅ Sign-in successful: ${ctx.context.session?.user.email} from IP: ${ctx.request?.headers.get('x-forwarded-for')}`
				);
			}
			if (ctx.path.includes('/reset-password')) {
				logger.info('🔑 Password reset requested');
			}
		})
	},
	advanced: {
		cookiePrefix: 'sheppakai_budget',
		useSecureCookies: true,
		ipAddress: {
			// Enable IP address and user agent tracking
			disableIpTracking: false,
			// Optionally specify custom headers for IP detection (useful behind proxies)
			ipAddressHeaders: ['x-forwarded-for', 'x-real-ip', 'x-client-ip']
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
		'https://sheppakai-budget.fly.dev',
		...(env.NODE_ENV === 'development' ? ['http://localhost:5173'] : [])
	],
	rateLimit: {
		enabled: true,
		window: 60, // 1 minute
		max: 5, // max 5 requests per window per IP
		storage: env.NODE_ENV === 'production' ? 'database' : 'memory'
	},
	plugins: [
		admin({
			adminUserIds: ADMIN_USER_IDS
		}),
		sveltekitCookies(getRequestEvent)
	] // make sure this is the last plugin in the array
});

/**
 * Require admin access - checks both hardcoded admin user IDs and role field
 * @param locals - SvelteKit locals object containing user data
 * @throws {Error} If user is not authenticated or not an admin
 */
export function requireAdmin(locals: App.Locals): void {
	if (!locals.user) {
		throw new Error('Unauthorized - not authenticated');
	}

	// Check hardcoded admin IDs
	const isHardcodedAdmin = ADMIN_USER_IDS.includes(locals.user.id);

	// Check role field
	const isRoleAdmin = locals.user.role === 'admin';

	if (!isHardcodedAdmin && !isRoleAdmin) {
		throw new Error('Forbidden - admin access required');
	}
}
