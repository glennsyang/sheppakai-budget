import { beforeEach, describe, expect, it, vi } from 'vitest';

const { banUserMock, setRoleMock, disableApiKeysForUserMock, loggerMock } = vi.hoisted(() => ({
	banUserMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	setRoleMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	disableApiKeysForUserMock: vi.fn<(userId: string) => Promise<number>>(),
	loggerMock: {
		error: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		debug: vi.fn<() => void>()
	}
}));

vi.mock('$app/env/private', () => ({ ADMIN_USER_IDS: 'env-admin' }));

vi.mock('$lib/server/auth', () => ({
	auth: { api: { banUser: banUserMock, setRole: setRoleMock } },
	assertAdmin: (locals: App.Locals) => {
		if (locals.user?.role !== 'admin') throw new Error('Forbidden');
	}
}));

vi.mock('$lib/server/db/writes/api-keys', () => ({
	disableApiKeysForUser: disableApiKeysForUserMock
}));

vi.mock('$lib/server/logger', () => ({ logger: loggerMock }));

import { actions } from './+page.server';

const adminLocals = { user: { id: 'admin-1', role: 'admin' } } as App.Locals;

function post(fields: Record<string, string>) {
	return new Request('https://budget.example.com/admin/users', {
		method: 'POST',
		body: new URLSearchParams(fields)
	});
}

describe('admin users actions: API keys follow the owner', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		banUserMock.mockResolvedValue({});
		setRoleMock.mockResolvedValue({});
		disableApiKeysForUserMock.mockResolvedValue(2);
	});

	describe('banUser', () => {
		it("disables the banned user's API keys", async () => {
			const result = await actions.banUser({
				request: post({ userId: 'u-2', banReason: 'abuse' }),
				locals: adminLocals
			} as never);

			expect(banUserMock).toHaveBeenCalledOnce();
			expect(disableApiKeysForUserMock).toHaveBeenCalledWith('u-2');
			expect(result).toMatchObject({ form: { message: { type: 'success' } } });
		});

		it('does not touch keys when the ban itself fails', async () => {
			banUserMock.mockRejectedValue(new Error('nope'));

			const result = await actions.banUser({
				request: post({ userId: 'u-2', banReason: 'abuse' }),
				locals: adminLocals
			} as never);

			expect(disableApiKeysForUserMock).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 500 });
		});

		it('reports an error when the ban succeeds but disabling keys fails', async () => {
			disableApiKeysForUserMock.mockRejectedValue(new Error('db down'));

			const result = await actions.banUser({
				request: post({ userId: 'u-2', banReason: 'abuse' }),
				locals: adminLocals
			} as never);

			expect(result).toMatchObject({
				status: 500,
				data: {
					form: {
						message: {
							type: 'error',
							text: 'User banned, but failed to disable their API keys'
						}
					}
				}
			});
		});

		it('rejects a non-admin caller without banning or disabling anything', async () => {
			const result = await actions.banUser({
				request: post({ userId: 'u-2', banReason: 'abuse' }),
				locals: { user: { id: 'u-3', role: 'user' } } as App.Locals
			} as never);

			expect(banUserMock).not.toHaveBeenCalled();
			expect(disableApiKeysForUserMock).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 403 });
		});
	});

	describe('setRole', () => {
		it("disables the user's API keys when they are demoted to user", async () => {
			const result = await actions.setRole({
				request: post({ userId: 'u-2', role: 'user' }),
				locals: adminLocals
			} as never);

			expect(setRoleMock).toHaveBeenCalledOnce();
			expect(disableApiKeysForUserMock).toHaveBeenCalledWith('u-2');
			expect(result).toMatchObject({ form: { message: { type: 'success' } } });
		});

		it('leaves keys alone when the user is promoted to admin', async () => {
			await actions.setRole({
				request: post({ userId: 'u-2', role: 'admin' }),
				locals: adminLocals
			} as never);

			expect(disableApiKeysForUserMock).not.toHaveBeenCalled();
		});

		it('leaves keys alone for an ADMIN_USER_IDS admin, who stays admin whatever their role', async () => {
			await actions.setRole({
				request: post({ userId: 'env-admin', role: 'user' }),
				locals: adminLocals
			} as never);

			expect(disableApiKeysForUserMock).not.toHaveBeenCalled();
		});

		it('reports an error when the demotion succeeds but disabling keys fails', async () => {
			disableApiKeysForUserMock.mockRejectedValue(new Error('db down'));

			const result = await actions.setRole({
				request: post({ userId: 'u-2', role: 'user' }),
				locals: adminLocals
			} as never);

			expect(result).toMatchObject({
				status: 500,
				data: { form: { message: { type: 'error' } } }
			});
		});
	});
});
