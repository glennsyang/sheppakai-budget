import { describe, expect, it, vi } from 'vitest';

const mockFail = vi.hoisted(() =>
	vi.fn<
		(
			status: number,
			data: Record<string, unknown>
		) => { status: number; data: Record<string, unknown>; __failure: boolean }
	>((status, data) => ({ status, data, __failure: true }))
);

const mockRedirect = vi.hoisted(() =>
	vi.fn<(status: number, location: string) => never>((status, location) => {
		throw new Error(`redirect ${status} ${location}`);
	})
);

vi.mock('@sveltejs/kit', () => ({
	fail: mockFail,
	redirect: mockRedirect
}));

import { getUser, requireAdmin, requireAuth } from './auth-guard';

describe('requireAuth', () => {
	it('returns 401 failure when user is missing', async () => {
		const handler = vi.fn<() => Promise<unknown>>();
		const wrapped = requireAuth(handler);
		const event = {
			locals: { user: null }
		} as unknown as Parameters<typeof wrapped>[0];

		const result = await wrapped(event);

		expect(mockFail).toHaveBeenCalledWith(401, { error: 'Unauthorized' });
		expect(result).toEqual({ status: 401, data: { error: 'Unauthorized' }, __failure: true });
		expect(handler).not.toHaveBeenCalled();
	});

	it('calls handler with authenticated user', async () => {
		const handler = vi.fn<() => Promise<{ ok: boolean }>>(async () => ({ ok: true }));
		const wrapped = requireAuth(handler);
		const user = { id: 'user-123' };
		const event = {
			locals: { user }
		} as unknown as Parameters<typeof wrapped>[0];

		const result = await wrapped(event);

		expect(handler).toHaveBeenCalledWith(event, user);
		expect(result).toEqual({ ok: true });
	});
});

describe('getUser', () => {
	it('redirects to sign-in when the user is missing', () => {
		mockRedirect.mockClear();
		const locals = { user: undefined } as App.Locals;

		expect(() => getUser(locals)).toThrow('redirect 302 /sign-in');
		expect(mockRedirect).toHaveBeenCalledWith(302, '/sign-in');
	});

	it('returns the authenticated user when present', () => {
		mockRedirect.mockClear();
		const user = { id: 'user-123' };
		const locals = { user } as unknown as App.Locals;

		expect(getUser(locals)).toBe(user);
		expect(mockRedirect).not.toHaveBeenCalled();
	});
});

describe('requireAdmin', () => {
	it('returns 401 failure when user is missing', async () => {
		const handler = vi.fn<() => Promise<unknown>>();
		const wrapped = requireAdmin(handler);
		const event = {
			locals: { user: null }
		} as unknown as Parameters<typeof wrapped>[0];

		const result = await wrapped(event);

		expect(mockFail).toHaveBeenCalledWith(401, { error: 'Unauthorized' });
		expect(result).toEqual({ status: 401, data: { error: 'Unauthorized' }, __failure: true });
		expect(handler).not.toHaveBeenCalled();
	});

	it('returns 403 failure when the user is not an admin', async () => {
		const handler = vi.fn<() => Promise<unknown>>();
		const wrapped = requireAdmin(handler);
		const event = {
			locals: { user: { id: 'user-123', role: 'user' } }
		} as unknown as Parameters<typeof wrapped>[0];

		const result = await wrapped(event);

		expect(mockFail).toHaveBeenCalledWith(403, { error: 'Forbidden' });
		expect(result).toEqual({ status: 403, data: { error: 'Forbidden' }, __failure: true });
		expect(handler).not.toHaveBeenCalled();
	});

	it('calls handler with the authenticated admin user', async () => {
		const handler = vi.fn<() => Promise<{ ok: boolean }>>(async () => ({ ok: true }));
		const wrapped = requireAdmin(handler);
		const user = { id: 'user-123', role: 'admin' };
		const event = {
			locals: { user }
		} as unknown as Parameters<typeof wrapped>[0];

		const result = await wrapped(event);

		expect(handler).toHaveBeenCalledWith(event, user);
		expect(result).toEqual({ ok: true });
	});
});
