import { building } from '$app/env';
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

const DUMMY_DB_URL = 'file:///tmp/build.db';
const DUMMY_AUTH_SECRET = 'build_time_dummy_secret_min_32_chars_long';
const DUMMY_CRON_SECRET = 'dummy_cron_secret_for_build';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'SQLite database file path (e.g. data/mybudget.db)',
		schema: building
			? z.string().default(DUMMY_DB_URL)
			: z
					.string()
					.min(1)
					.refine((v) => v !== DUMMY_DB_URL, {
						message: 'Cannot use the build-time dummy DATABASE_URL'
					})
	},
	BETTER_AUTH_SECRET: {
		description: 'Secret key for Better Auth (minimum 32 characters)',
		schema: building
			? z.string().default(DUMMY_AUTH_SECRET)
			: z
					.string()
					.min(32)
					.refine((v) => v !== DUMMY_AUTH_SECRET, {
						message: 'Cannot use the build-time dummy BETTER_AUTH_SECRET'
					})
	},
	CRON_SECRET: {
		description: 'Secret token for authenticating cron job HTTP requests',
		schema: building ? z.string().default(DUMMY_CRON_SECRET) : z.string().min(1)
	},
	BETTER_AUTH_BASE_URL: {
		description: 'Base URL for Better Auth callbacks and password reset redirects',
		schema: z.url().default('http://localhost:5173')
	},
	RESEND_API_KEY: {
		description: 'Resend API key for sending transactional emails',
		schema: z.string().default('dummy_key_for_build')
	},
	RESEND_FROM_ADDRESS: {
		description: 'From address for outgoing transactional emails',
		schema: z.email().default('noreply@example.com')
	},
	RESEND_NEW_USER_ADDRESS: {
		description: 'Address to CC on new user registration confirmation emails',
		schema: z.email().default('admin@example.com')
	},
	ADMIN_USER_IDS: {
		description: 'Comma-separated list of hardcoded admin user IDs',
		schema: z.string().default('dummy_admin_id')
	},
	AUTH_ALERTS_URL: {
		description: 'Ntfy.sh URL for authentication and security alert push notifications',
		schema: z.url().default('https://notification-service.com/dummy-auth-alerts')
	},
	BUDGET_ALERTS_URL: {
		description: 'Ntfy.sh URL for budget threshold alert push notifications',
		schema: z.url().default('https://notification-service.com/dummy-budget-alerts')
	},
	NODE_ENV: {
		description: 'Application runtime environment',
		schema: z.enum(['development', 'production', 'test']).default('development')
	}
});
