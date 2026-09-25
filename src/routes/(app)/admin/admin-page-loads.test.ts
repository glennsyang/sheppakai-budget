import { isHttpError } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	getDb: vi.fn<() => unknown>(),
	listApiKeys: vi.fn<() => Promise<unknown>>(),
	listUsers: vi.fn<() => Promise<unknown>>()
}));

vi.mock('$lib/server/db', () => ({ getDb: mockState.getDb }));

// Importing the real module boots better-auth, so fake assertAdmin with the same
// 401/403 contract. What these tests pin down is that each load guards itself
// before touching data, rather than relying on the parent layout.
vi.mock('$lib/server/auth', async () => {
	const { error } = await import('@sveltejs/kit');
	return {
		assertAdmin: (locals: App.Locals) => {
			if (!locals.user) throw error(401, 'Unauthorized');
			if (locals.user.role !== 'admin') throw error(403, 'Forbidden');
		},
		auth: { api: { listApiKeys: mockState.listApiKeys, listUsers: mockState.listUsers } }
	};
});

vi.mock('$lib/server/logger', () => ({
	logger: {
		debug: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		error: vi.fn<() => void>()
	}
}));

import { load as apiKeysLoad } from './api-keys/+page.server';
import { load as apiLogsLoad } from './api-logs/+page.server';
import { load as archivedGoalsLoad } from './archived-goals/+page.server';
import { load as usersLoad } from './users/+page.server';

const loads = {
	'api-keys': apiKeysLoad,
	'api-logs': apiLogsLoad,
	'archived-goals': archivedGoalsLoad,
	users: usersLoad
};

async function statusOf(promise: unknown): Promise<number | undefined> {
	try {
		await promise;
		return undefined;
	} catch (error) {
		return isHttpError(error) ? error.status : undefined;
	}
}

const ADMIN_URL = 'https://budget.example.com/admin';

function event(user: unknown) {
	return {
		locals: { user },
		request: new Request(ADMIN_URL),
		url: new URL(ADMIN_URL),
		route: { id: null }
	} as never;
}

describe.each(Object.entries(loads))('admin/%s load', (_name, load) => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects anonymous callers with 401 before touching data', async () => {
		expect(await statusOf(load(event(undefined)))).toBe(401);
		expect(mockState.getDb).not.toHaveBeenCalled();
		expect(mockState.listApiKeys).not.toHaveBeenCalled();
		expect(mockState.listUsers).not.toHaveBeenCalled();
	});

	it('rejects non-admin users with 403 before touching data', async () => {
		const nonAdmin = { id: 'not-an-admin-user-id', role: 'user' };

		expect(await statusOf(load(event(nonAdmin)))).toBe(403);
		expect(mockState.getDb).not.toHaveBeenCalled();
		expect(mockState.listApiKeys).not.toHaveBeenCalled();
		expect(mockState.listUsers).not.toHaveBeenCalled();
	});
});
