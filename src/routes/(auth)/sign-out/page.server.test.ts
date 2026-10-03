import { isRedirect } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signOutMock, loggerMock } = vi.hoisted(() => ({
	signOutMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	loggerMock: {
		error: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		debug: vi.fn<() => void>()
	}
}));

vi.mock('$lib/server/auth', () => ({
	auth: { api: { signOut: signOutMock } }
}));

vi.mock('$lib/server/logger', () => ({ logger: loggerMock }));

import { SIGN_IN_ROUTE } from '$lib/auth-routes';

import { actions } from './+page.server';

async function runSignOut() {
	const request = new Request('https://budget.example.com/sign-out', { method: 'POST' });
	const event = { request } as unknown as Parameters<typeof actions.default>[0];

	try {
		await actions.default(event);
	} catch (thrown) {
		return thrown;
	}
	throw new Error('Expected sign-out to throw a redirect');
}

describe('sign-out default action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('revokes the session and redirects to sign-in', async () => {
		signOutMock.mockResolvedValueOnce({ success: true });

		const thrown = await runSignOut();

		expect(signOutMock).toHaveBeenCalledOnce();
		expect(isRedirect(thrown) && thrown.location).toBe(SIGN_IN_ROUTE);
		expect(loggerMock.error).not.toHaveBeenCalled();
	});

	it('logs and still redirects to sign-in when Better Auth fails', async () => {
		signOutMock.mockRejectedValueOnce(new Error('session store down'));

		const thrown = await runSignOut();

		expect(isRedirect(thrown) && thrown.location).toBe(SIGN_IN_ROUTE);
		expect(loggerMock.error).toHaveBeenCalledWith('Sign-out failed', expect.any(Error));
	});
});
