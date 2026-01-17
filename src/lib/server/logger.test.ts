import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from './logger';

describe('Logger Utility', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('info()', () => {
		it('should log info messages without data', () => {
			logger.info('Test message');
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test message'));
		});

		it('should log info messages with data in development', () => {
			logger.info('User action', { userId: '123', action: 'login' });
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('[INFO] User action'),
				expect.objectContaining({ userId: '123', action: 'login' })
			);
		});

		it('should include ISO timestamp', () => {
			logger.info('Test');
			const call = consoleLogSpy.mock.calls[0][0] as string;
			// Check for ISO timestamp format
			expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
		});
	});

	describe('warn()', () => {
		it('should log warning messages', () => {
			logger.warn('Warning message');
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('[WARN] Warning message')
			);
		});

		it('should log warnings with data', () => {
			logger.warn('Deprecated API', { endpoint: '/old-api' });
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('[WARN] Deprecated API'),
				expect.objectContaining({ endpoint: '/old-api' })
			);
		});
	});

	describe('error()', () => {
		it('should log error messages without data', () => {
			logger.error('Error occurred');
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR] Error occurred')
			);
		});

		it('should log error messages with Error objects in development', () => {
			const error = new Error('Database connection failed');
			logger.error('Database error', error);
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR] Database error'),
				error
			);
		});

		it('should log error messages with context data', () => {
			logger.error('Operation failed', { operation: 'save', retries: 3 });
			expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR] Operation failed'),
				expect.objectContaining({ operation: 'save', retries: 3 })
			);
		});
	});

	describe('debug()', () => {
		it('should log debug messages in development', () => {
			logger.debug('Debug info', { step: 1 });
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('[DEBUG] Debug info'),
				expect.objectContaining({ step: 1 })
			);
		});

		it('should log debug messages without data', () => {
			logger.debug('Debug checkpoint');
			expect(consoleLogSpy).toHaveBeenCalledTimes(1);
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('[DEBUG] Debug checkpoint')
			);
		});
	});

	describe('PII Sanitization in Development', () => {
		it('should include user IDs in development mode', () => {
			logger.info('User created', { userId: 'abc123', email: 'test@example.com' });
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({ userId: 'abc123', email: 'test@example.com' })
			);
		});

		it('should include all data fields in development', () => {
			const data = {
				userId: '123',
				email: 'user@test.com',
				name: 'Test User',
				action: 'update'
			};
			logger.info('User updated', data);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining(data));
		});
	});

	describe('Message Formatting', () => {
		it('should format messages consistently', () => {
			logger.info('Test');
			logger.warn('Test');
			logger.error('Test');
			logger.debug('Test');

			// All should have timestamp and level
			expect(consoleLogSpy.mock.calls[0][0]).toMatch(/\[.*\] \[INFO\] Test/);
			expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/\[.*\] \[WARN\] Test/);
			expect(consoleErrorSpy.mock.calls[0][0]).toMatch(/\[.*\] \[ERROR\] Test/);
			expect(consoleLogSpy.mock.calls[1][0]).toMatch(/\[.*\] \[DEBUG\] Test/);
		});
	});

	describe('Edge Cases', () => {
		it('should handle null data', () => {
			logger.info('Test', null);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test'), null);
		});

		it('should handle undefined data', () => {
			logger.info('Test', undefined);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test'));
		});

		it('should handle empty objects', () => {
			logger.info('Test', {});
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test'), {});
		});

		it('should handle primitive data types', () => {
			logger.info('Test', 'string data');
			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('[INFO] Test'),
				'string data'
			);
		});

		it('should handle numbers', () => {
			logger.info('Test', 42);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test'), 42);
		});

		it('should handle booleans', () => {
			logger.info('Test', true);
			expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO] Test'), true);
		});
	});

	describe('Error Object Handling', () => {
		it('should handle Error instances', () => {
			const error = new Error('Test error');
			error.stack = 'Error: Test error\n    at test.ts:10:5';
			logger.error('Error occurred', error);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR] Error occurred'),
				error
			);
		});

		it('should handle custom error objects', () => {
			const customError = { message: 'Custom error', code: 500 };
			logger.error('Custom error', customError);
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				expect.stringContaining('[ERROR] Custom error'),
				expect.objectContaining({ message: 'Custom error', code: 500 })
			);
		});
	});
});
