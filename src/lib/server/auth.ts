import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { Resend } from 'resend';

import { getRequestEvent } from '$app/server';

import * as schema from './db/schema';
import { getDb } from './db';

import { RESEND_API_KEY, RESEND_FROM_ADDRESS, RESEND_NEW_USER_ADDRESS } from '$env/static/private';

export const auth = betterAuth({
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
		}),
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.includes('/register')) {
				const newSession = ctx.context.newSession;
				if (newSession) {
					void sendEmail({
						to: RESEND_NEW_USER_ADDRESS,
						subject: '[Sheppakai Budget] New User was registered!',
						text: `Hi ${newSession.user.name || newSession.user.email}!<br><br>Welcome to Sheppakai Budget! We're excited to have you on board.<br><br>Thank you,<br>Sheppakai Budget Team`
					});
				}
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
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		minPasswordLength: 8,
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
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // Update every 24 hours
	},
	plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});

// Initialize Resend email client
const resend = new Resend(RESEND_API_KEY);
async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
	console.log('📧 Email sent to:', to);

	try {
		const { data, error } = await resend.emails.send({
			from: RESEND_FROM_ADDRESS,
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
