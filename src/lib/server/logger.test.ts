import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Logger Utility', () => {
	let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
	let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
	const originalLogLevel = process.env.LOG_LEVEL;

	beforeEach(() => {
		consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
		consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		if (originalLogLevel === undefined) delete process.env.LOG_LEVEL;
		else process.env.LOG_LEVEL = originalLogLevel;
		vi.resetModules();
	});

	function lastEntry(spy: ReturnType<typeof vi.spyOn>): Record<string, unknown> {
		const call = spy.mock.calls.at(-1);
		expect(call).toBeDefined();
		return JSON.parse(call![0] as string);
	}

	describe('output shape', () => {
		it('logs info messages as structured JSON to console.info', async () => {
			const { logger } = await import('./logger');
			logger.info('Test message');
			expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ level: 'info', message: 'Test message' });
			expect(entry.timestamp).toEqual(
				expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
			);
		});

		it('merges meta fields into the log entry', async () => {
			const { logger } = await import('./logger');
			logger.info('User action', { action: 'login' });
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ message: 'User action', action: 'login' });
		});

		it('routes debug/info/warn/error to their respective console methods', async () => {
			const { logger } = await import('./logger');
			logger.debug('d');
			logger.info('i');
			logger.warn('w');
			logger.error('e');
			expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
			expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('level filtering via LOG_LEVEL', () => {
		it('suppresses debug logs by default outside dev (min level info)', async () => {
			vi.stubEnv('NODE_ENV', 'production');
			delete process.env.LOG_LEVEL;
			vi.resetModules();
			const { logger } = await import('./logger');
			logger.debug('should be suppressed');
			expect(consoleDebugSpy).not.toHaveBeenCalled();
		});

		it('respects an explicit LOG_LEVEL override', async () => {
			vi.stubEnv('NODE_ENV', 'production');
			vi.stubEnv('LOG_LEVEL', 'warn');
			vi.resetModules();
			const { logger } = await import('./logger');
			logger.info('should be suppressed');
			logger.warn('should log');
			expect(consoleInfoSpy).not.toHaveBeenCalled();
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe('PII stripping in production', () => {
		it('strips PII fields from meta in production', async () => {
			vi.stubEnv('NODE_ENV', 'production');
			vi.resetModules();
			const { logger } = await import('./logger');
			logger.info('User created', {
				userId: 'abc123',
				id: 'rec1',
				email: 'test@example.com',
				password: 'secret',
				token: 'tok',
				createdBy: 'x',
				updatedBy: 'y',
				action: 'created'
			});
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).not.toHaveProperty('userId');
			expect(entry).not.toHaveProperty('id');
			expect(entry).not.toHaveProperty('email');
			expect(entry).not.toHaveProperty('password');
			expect(entry).not.toHaveProperty('token');
			expect(entry).not.toHaveProperty('createdBy');
			expect(entry).not.toHaveProperty('updatedBy');
			expect(entry).toMatchObject({ action: 'created' });
		});

		it('does not strip requestId, which is exempt from PII stripping', async () => {
			vi.stubEnv('NODE_ENV', 'production');
			vi.resetModules();
			const { logger } = await import('./logger');
			const child = logger.child({ requestId: 'req-1' });
			child.info('Incoming request');
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ requestId: 'req-1' });
		});

		it('keeps PII fields intact in development', async () => {
			vi.stubEnv('NODE_ENV', 'development');
			vi.resetModules();
			const { logger } = await import('./logger');
			logger.info('User created', { userId: 'abc123', email: 'test@example.com' });
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ userId: 'abc123', email: 'test@example.com' });
		});
	});

	describe('child()', () => {
		it('carries context onto every subsequent call', async () => {
			const { logger } = await import('./logger');
			const child = logger.child({ requestId: 'req-42', method: 'GET' });
			child.info('Incoming request');
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ requestId: 'req-42', method: 'GET' });
		});

		it('merges nested child context without mutating the parent', async () => {
			const { logger } = await import('./logger');
			const child = logger.child({ requestId: 'req-1' });
			const grandchild = child.child({ userId: 'user-1' });

			grandchild.info('resolved user');
			const grandchildEntry = lastEntry(consoleInfoSpy);
			expect(grandchildEntry).toMatchObject({ requestId: 'req-1', userId: 'user-1' });

			child.info('parent still has no userId');
			const parentEntry = lastEntry(consoleInfoSpy);
			expect(parentEntry).not.toHaveProperty('userId');
		});

		it('lets call-level meta override child context', async () => {
			const { logger } = await import('./logger');
			const child = logger.child({ requestId: 'req-1' });
			child.info('override', { requestId: 'req-2' });
			const entry = lastEntry(consoleInfoSpy);
			expect(entry).toMatchObject({ requestId: 'req-2' });
		});
	});

	describe('error()', () => {
		it('accepts no error argument', async () => {
			const { logger } = await import('./logger');
			logger.error('Error occurred');
			const entry = lastEntry(consoleErrorSpy);
			expect(entry).toMatchObject({ level: 'error', message: 'Error occurred' });
			expect(entry).not.toHaveProperty('error');
		});

		it('accepts a string error', async () => {
			const { logger } = await import('./logger');
			logger.error('Error occurred', 'boom');
			const entry = lastEntry(consoleErrorSpy);
			expect(entry).toMatchObject({ error: 'boom' });
		});

		it('serializes an Error instance to name/message in production (no stack)', async () => {
			vi.stubEnv('NODE_ENV', 'production');
			vi.resetModules();
			const { logger } = await import('./logger');
			const error = new Error('Database connection failed');
			logger.error('Database error', error);
			const entry = lastEntry(consoleErrorSpy);
			expect(entry.error).toMatchObject({ name: 'Error', message: 'Database connection failed' });
			expect((entry.error as Record<string, unknown>).stack).toBeUndefined();
		});

		it('includes the stack trace for an Error instance in development', async () => {
			vi.stubEnv('NODE_ENV', 'development');
			vi.resetModules();
			const { logger } = await import('./logger');
			const error = new Error('Database connection failed');
			logger.error('Database error', error);
			const entry = lastEntry(consoleErrorSpy);
			expect((entry.error as Record<string, unknown>).stack).toBeDefined();
		});

		it('merges additional meta alongside the error', async () => {
			const { logger } = await import('./logger');
			logger.error('Operation failed', new Error('boom'), { operation: 'save', retries: 3 });
			const entry = lastEntry(consoleErrorSpy);
			expect(entry).toMatchObject({ operation: 'save', retries: 3 });
		});
	});
});
