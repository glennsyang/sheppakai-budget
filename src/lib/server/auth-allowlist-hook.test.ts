import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	sendAuthAlerts: vi.fn<(message: string, title?: string, priority?: number) => void>()
}));

vi.mock('better-auth/api', () => ({
	// Treat the middleware wrapper as identity so the callback can be called directly.
	createAuthMiddleware: (fn: unknown) => fn,
	APIError: class APIError extends Error {
		constructor(
			public status: string,
			body: { message: string }
		) {
			super(body.message);
		}
	}
}));

vi.mock('./notifications', () => ({ sendAuthAlerts: mockState.sendAuthAlerts }));

import { createAllowlistBeforeHook, parseAllowedEmails } from './auth-allowlist-hook';

type FakeCtx = { path: string; body?: { email?: unknown } };

const hook = createAllowlistBeforeHook(
	'Test App',
	parseAllowedEmails(' Owner@Example.com , partner@example.com,, ')
) as unknown as (ctx: FakeCtx) => Promise<void>;

beforeEach(() => mockState.sendAuthAlerts.mockClear());

describe('parseAllowedEmails', () => {
	it('trims, lowercases and drops empty entries', () => {
		expect(parseAllowedEmails(' A@x.com,, b@X.com ')).toEqual(new Set(['a@x.com', 'b@x.com']));
		expect(parseAllowedEmails('').size).toBe(0);
	});
});

describe('createAllowlistBeforeHook', () => {
	it('allows sign-in for an allowlisted email, case-insensitively', async () => {
		await expect(
			hook({ path: '/sign-in/email', body: { email: 'OWNER@example.com ' } })
		).resolves.toBeUndefined();
		expect(mockState.sendAuthAlerts).not.toHaveBeenCalled();
	});

	it('rejects a lookalike email that merely contains the old substring', async () => {
		await expect(
			hook({ path: '/sign-in/email', body: { email: 'x+sheppard@gmail.com' } })
		).rejects.toThrow('Invalid email or password');
		expect(mockState.sendAuthAlerts).toHaveBeenCalledWith(
			expect.stringContaining('x+sheppard@gmail.com'),
			'Test App - Security Alert',
			4
		);
	});

	it('rejects sign-up for a non-allowlisted email', async () => {
		await expect(
			hook({ path: '/sign-up/email', body: { email: 'stranger@example.com' } })
		).rejects.toThrow('Invalid email or password');
	});

	it('rejects a missing or non-string email', async () => {
		await expect(hook({ path: '/sign-in/email' })).rejects.toThrow('Invalid email or password');
		await expect(hook({ path: '/sign-in/email', body: { email: 42 } })).rejects.toThrow(
			'Invalid email or password'
		);
	});

	it('ignores unguarded paths', async () => {
		await expect(
			hook({ path: '/get-session', body: { email: 'stranger@example.com' } })
		).resolves.toBeUndefined();
	});
});
