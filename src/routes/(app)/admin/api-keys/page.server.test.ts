import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listAllWithOwnerMock, deleteApiKeyByIdMock, loggerMock } = vi.hoisted(() => ({
	listAllWithOwnerMock: vi.fn<() => Promise<unknown[]>>(),
	deleteApiKeyByIdMock: vi.fn<(keyId: string) => Promise<boolean>>(),
	loggerMock: {
		error: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		debug: vi.fn<() => void>()
	}
}));

vi.mock('$lib/server/auth', () => ({
	auth: { api: {} },
	assertAdmin: (locals: App.Locals) => {
		if (locals.user?.role !== 'admin') throw new Error('Forbidden');
	}
}));

vi.mock('$lib/server/db/queries', () => ({
	apiKeyQueries: { listAllWithOwner: listAllWithOwnerMock }
}));

vi.mock('$lib/server/db/writes/api-keys', () => ({
	deleteApiKeyById: deleteApiKeyByIdMock
}));

vi.mock('$lib/server/logger', () => ({ logger: loggerMock }));

import { actions, load } from './+page.server';

const adminLocals = { user: { id: 'admin-1', role: 'admin' } } as App.Locals;

// Sentry's Vite plugin auto-wraps `load`, and its wrapper reads `event.request`/`route`.
function loadEvent(locals: App.Locals) {
	return {
		locals,
		request: new Request('https://budget.example.com/admin/api-keys'),
		route: { id: '/(app)/admin/api-keys' }
	} as never;
}

function revokeRequest(id: string) {
	return new Request('https://budget.example.com/admin/api-keys?/revoke', {
		method: 'POST',
		body: new URLSearchParams({ id })
	});
}

describe('admin api-keys page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		listAllWithOwnerMock.mockResolvedValue([]);
		deleteApiKeyByIdMock.mockResolvedValue(true);
	});

	describe('load', () => {
		it("lists every user's keys, not just the caller's", async () => {
			const keys = [
				{ id: 'k1', ownerId: 'admin-1' },
				{ id: 'k2', ownerId: 'admin-2' }
			];
			listAllWithOwnerMock.mockResolvedValue(keys);

			const result = await load(loadEvent(adminLocals));

			expect(result).toMatchObject({ apiKeys: keys });
		});

		it('refuses a non-admin before querying any keys', async () => {
			await expect(
				load(loadEvent({ user: { id: 'u-1', role: 'user' } } as App.Locals))
			).rejects.toThrow('Forbidden');
			expect(listAllWithOwnerMock).not.toHaveBeenCalled();
		});
	});

	describe('revoke', () => {
		it('deletes a key by id regardless of who owns it', async () => {
			const result = await actions.revoke({
				request: revokeRequest('other-admins-key'),
				locals: adminLocals
			} as never);

			expect(deleteApiKeyByIdMock).toHaveBeenCalledWith('other-admins-key');
			expect(result).toMatchObject({ form: { message: { type: 'success' } } });
		});

		it('returns 404 when the key does not exist', async () => {
			deleteApiKeyByIdMock.mockResolvedValue(false);

			const result = await actions.revoke({
				request: revokeRequest('missing'),
				locals: adminLocals
			} as never);

			expect(result).toMatchObject({
				status: 404,
				data: { form: { message: { type: 'error', text: 'API key not found.' } } }
			});
		});

		it('rejects a non-admin caller without deleting anything', async () => {
			const result = await actions.revoke({
				request: revokeRequest('k1'),
				locals: { user: { id: 'u-1', role: 'user' } } as App.Locals
			} as never);

			expect(deleteApiKeyByIdMock).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 403 });
		});
	});
});
