import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { Resend } from 'resend';

import { getRequestEvent } from '$app/server';

import * as schema from './db/schema';
import { getDb } from './db';

import { env } from '$env/dynamic/private';

export const auth = betterAuth({
	appName: 'Sheppakai Budget',
	secret: env.BETTER_AUTH_SECRET || 'build_time_dummy_secret_min_32_chars_long',
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
			void sendEmail({
				to: user.email,
				subject: '[Sheppakai Budget] Reset your password',
				text: `Hi ${user.email}!<br><br>Click the link to reset your password: ${resetUrl}<br><br>This link will expire in 10 minutes.<br><br>Thank you,<br>Sheppakai Budget Team`
			});
		},
		onPasswordReset: async ({ user }) => {
			console.log(`📧 Password for user ${user.email} has been reset.`);
		}
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url, token }) => {
			console.log(`📧 Email verification: url=${url}, token=${token}`);
			const verifyUrl = `${url}?token=${token}`;
			void sendEmail({
				to: user.email,
				subject: '[Sheppakai Budget] Verify your email address',
				text: `Hi ${user.email}!<br><br>Click the link to verify your email address: ${verifyUrl}<br><br>This link will expire in 10 minutes.<br><br>Thank you,<br>Sheppakai Budget Team`
			});
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
					void sendEmail({
						to: env.RESEND_NEW_USER_ADDRESS,
						subject: '[Sheppakai Budget] New User was registered!',
						text: `Hi ${newSession.user.name || newSession.user.email}!<br><br>Welcome to Sheppakai Budget! We're excited to have you on board.<br><br>Thank you,<br>Sheppakai Budget Team`
					});
				}
			}
			// Audit logging
			if (ctx.path.includes('/sign-in')) {
				console.log(
					`✅ Sign-in successful: ${ctx.context.session?.user.email} from IP: ${ctx.request?.headers.get('x-forwarded-for')}`
				);
			}
			if (ctx.path.includes('/reset-password')) {
				console.log(`🔐 Password reset requested: ${ctx.context.user?.email}`);
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
	plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});

// Initialize Resend email client
const resend = new Resend(env.RESEND_API_KEY || 'dummy_key_for_build');

async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
	console.log('📧 Email sent to:', to);

	try {
		const { data, error } = await resend.emails.send({
			from: env.RESEND_FROM_ADDRESS,
			to,
			subject,
			html: text
		});

		if (error) {
			console.error('Error sending email via Resend:', error);
			return error;
		}

		return data;
	} catch (error) {
		console.error('Error sending email via Resend:', error);
		return error;
	}
}
