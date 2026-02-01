import * as Sentry from '@sentry/sveltekit';

import { dev } from '$app/environment';

/**
 * Structured logger utility for server-side logging.
 * Automatically sanitizes PII (user IDs, emails, sensitive data) in production.
 * Errors are automatically sent to Sentry in production.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogContext {
	[key: string]: unknown;
}

/**
 * Sanitizes data by removing PII fields in production mode.
 */
function sanitizeData(data: unknown): unknown {
	if (dev) {
		return data;
	}

	if (!data || typeof data !== 'object') {
		return undefined;
	}

	if (data instanceof Error) {
		// In production, only return the message, not the stack trace
		return { message: data.message };
	}

	// For objects, remove common PII fields
	const sanitized: Record<string, unknown> = {};
	const piiFields = ['userId', 'email', 'password', 'token', 'id', 'createdBy', 'updatedBy'];

	for (const [key, value] of Object.entries(data)) {
		if (piiFields.includes(key)) {
			continue; // Skip PII fields
		}
		sanitized[key] = value;
	}

	// Only return if there's something left after sanitization
	return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Formats a log message with timestamp and level.
 */
function formatMessage(level: LogLevel, message: string): string {
	const timestamp = new Date().toISOString();
	return `[${timestamp}] [${level}] ${message}`;
}

/**
 * Core logging function.
 */
function log(level: LogLevel, message: string, data?: unknown): void {
	const formattedMessage = formatMessage(level, message);
	const sanitized = sanitizeData(data);

	switch (level) {
		case 'ERROR':
			if (sanitized === undefined) {
				console.error(formattedMessage);
			} else {
				console.error(formattedMessage, sanitized);
			}
			// Send errors to Sentry in production
			if (!dev) {
				if (data instanceof Error) {
					Sentry.captureException(data, {
						tags: { source: 'logger' },
						extra: { message }
					});
				} else {
					Sentry.captureMessage(message, {
						level: 'error',
						tags: { source: 'logger' },
						extra: { data: sanitized }
					});
				}
			}
			break;
		case 'WARN':
			if (sanitized === undefined) {
				console.warn(formattedMessage);
			} else {
				console.warn(formattedMessage, sanitized);
			}
			// Send warnings to Sentry in production
			if (!dev) {
				Sentry.captureMessage(message, {
					level: 'warning',
					tags: { source: 'logger' },
					extra: { data: sanitized }
				});
			}
			break;
		case 'INFO':
		case 'DEBUG':
			if (sanitized === undefined) {
				console.log(formattedMessage);
			} else {
				console.log(formattedMessage, sanitized);
			}
			break;
	}
}

export const logger = {
	/**
	 * Log informational messages.
	 * In production, PII is automatically sanitized.
	 */
	info: (message: string, data?: LogContext | unknown): void => {
		log('INFO', message, data);
	},

	/**
	 * Log warning messages.
	 * In production, PII is automatically sanitized.
	 */
	warn: (message: string, data?: LogContext | unknown): void => {
		log('WARN', message, data);
	},

	/**
	 * Log error messages.
	 * In production, PII and stack traces are sanitized.
	 */
	error: (message: string, error?: Error | unknown): void => {
		log('ERROR', message, error);
	},

	/**
	 * Log debug messages.
	 * Only logs in development mode, completely silent in production.
	 */
	debug: (message: string, data?: LogContext | unknown): void => {
		if (dev) {
			log('DEBUG', message, data);
		}
	}
};
