import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRedirect = vi.hoisted(() =>
	vi.fn<(status: number, location: string) => never>((status, location) => {
		throw new Error(`redirect ${status} ${location}`);
	})
);

vi.mock('@sveltejs/kit', () => ({
	redirect: mockRedirect
}));

import { requireUser, SIGN_IN_ROUTE } from './auth-guard-load';

describe('requireUser', () => {
	beforeEach(() => {
		mockRedirect.mockClear();
	});

	it('redirects to sign-in when user is missing', () => {
		const locals = { user: undefined } as App.Locals;

		expect(() => requireUser(locals)).toThrow(`redirect 302 ${SIGN_IN_ROUTE}`);
		expect(mockRedirect).toHaveBeenCalledWith(302, SIGN_IN_ROUTE);
	});

	it('returns the authenticated user when present', () => {
		const user = { id: 'user-123' };
		const locals = { user } as unknown as App.Locals;

		expect(requireUser(locals)).toBe(user);
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});
