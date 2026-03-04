import { describe, expect, it, vi } from 'vitest';

const mockFail = vi.hoisted(() =>
	vi.fn((status: number, data: Record<string, unknown>) => ({ status, data, __failure: true }))
);

vi.mock('@sveltejs/kit', () => ({
	fail: mockFail
}));

import { requireAuth } from './auth-guard';

describe('requireAuth', () => {
	it('returns 401 failure when user is missing', async () => {
		const handler = vi.fn();
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
		const handler = vi.fn(async () => ({ ok: true }));
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
