import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	banUserMock,
	setRoleMock,
	createUserMock,
	getUserMock,
	disableApiKeysForUserMock,
	loggerMock,
	welcomeMock,
	sendAuthAlertsMock
} = vi.hoisted(() => ({
	banUserMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	setRoleMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	createUserMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	getUserMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	welcomeMock: {
		isEmailAllowlisted: vi.fn<(email: string) => boolean>(),
		allowlistCommandFor: vi.fn<(email: string) => string>(),
		sendWelcome: vi.fn<(user: unknown) => Promise<void>>()
	},
	sendAuthAlertsMock: vi.fn<(...args: unknown[]) => Promise<boolean>>(),
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
	auth: {
		api: {
			banUser: banUserMock,
			setRole: setRoleMock,
			createUser: createUserMock,
			getUser: getUserMock
		}
	},
	assertAdmin: (locals: App.Locals) => {
		if (locals.user?.role !== 'admin') throw new Error('Forbidden');
	}
}));

vi.mock('$lib/server/db/writes/api-keys', () => ({
	disableApiKeysForUser: disableApiKeysForUserMock
}));

vi.mock('$lib/server/logger', () => ({ logger: loggerMock }));

vi.mock('$lib/server/auth/welcome', () => welcomeMock);

vi.mock('$lib/server/notifications', () => ({ sendAuthAlerts: sendAuthAlertsMock }));

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

describe('admin users actions: create user + welcome email', () => {
	const newUser = { id: 'u-new', email: 'new@example.com', name: 'New Person' };

	beforeEach(() => {
		vi.clearAllMocks();
		createUserMock.mockResolvedValue({ user: newUser });
		getUserMock.mockResolvedValue(newUser);
		welcomeMock.isEmailAllowlisted.mockReturnValue(true);
		welcomeMock.allowlistCommandFor.mockReturnValue(
			'fly secrets set ALLOWED_EMAILS="a@example.com,new@example.com" -a sheppakai-budget'
		);
		welcomeMock.sendWelcome.mockResolvedValue();
		sendAuthAlertsMock.mockResolvedValue(true);
	});

	describe('createUser', () => {
		const fields = { name: 'New Person', email: 'new@example.com', role: 'user' };

		it('creates the user with a generated password and sends the welcome email', async () => {
			const result = await actions.createUser({
				request: post(fields),
				locals: adminLocals
			} as never);

			expect(createUserMock).toHaveBeenCalledOnce();
			const { body } = createUserMock.mock.calls[0][0] as {
				body: { name: string; email: string; role: string; password: string };
			};
			expect(body).toMatchObject({ name: 'New Person', email: 'new@example.com', role: 'user' });
			expect(body.password.length).toBeGreaterThanOrEqual(32);
			expect(welcomeMock.sendWelcome).toHaveBeenCalledWith(newUser);
			expect(sendAuthAlertsMock).toHaveBeenCalledOnce();
			expect(result).toMatchObject({ form: { message: { type: 'success' } } });

			// The generated password must never reach the logs.
			expect(JSON.stringify(loggerMock.info.mock.calls)).not.toContain(body.password);
			expect(loggerMock.info).toHaveBeenCalledWith('Admin created user', {
				adminId: 'admin-1',
				userId: 'u-new'
			});
		});

		it('returns a 400 message when the email already exists', async () => {
			createUserMock.mockRejectedValue({
				body: { code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' }
			});

			const result = await actions.createUser({
				request: post(fields),
				locals: adminLocals
			} as never);

			expect(welcomeMock.sendWelcome).not.toHaveBeenCalled();
			expect(result).toMatchObject({
				status: 400,
				data: {
					form: { message: { type: 'error', text: 'A user with this email already exists.' } }
				}
			});
		});

		it('rejects a non-admin caller without creating anything', async () => {
			const result = await actions.createUser({
				request: post(fields),
				locals: { user: { id: 'u-3', role: 'user' } } as App.Locals
			} as never);

			expect(createUserMock).not.toHaveBeenCalled();
			expect(welcomeMock.sendWelcome).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 403 });
		});

		it('rejects an invalid form', async () => {
			const result = await actions.createUser({
				request: post({ name: '', email: 'nope', role: 'user' }),
				locals: adminLocals
			} as never);

			expect(createUserMock).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 400 });
		});

		it('holds the welcome email and returns the fly command when not allowlisted', async () => {
			welcomeMock.isEmailAllowlisted.mockReturnValue(false);

			const result = await actions.createUser({
				request: post(fields),
				locals: adminLocals
			} as never);

			expect(createUserMock).toHaveBeenCalledOnce();
			expect(welcomeMock.sendWelcome).not.toHaveBeenCalled();
			expect(result).toMatchObject({
				form: { message: { type: 'success' } },
				allowlistCommand: expect.stringContaining('fly secrets set ALLOWED_EMAILS=')
			});
		});

		it('reports an error when the user is created but the welcome email fails', async () => {
			welcomeMock.sendWelcome.mockRejectedValue(new Error('brevo down'));

			const result = await actions.createUser({
				request: post(fields),
				locals: adminLocals
			} as never);

			expect(createUserMock).toHaveBeenCalledOnce();
			expect(result).toMatchObject({
				status: 500,
				data: { form: { message: { type: 'error' } } }
			});
		});
	});

	describe('sendWelcomeEmail', () => {
		it('sends the welcome email to an allowlisted user', async () => {
			const result = await actions.sendWelcomeEmail({
				request: post({ id: 'u-new' }),
				locals: adminLocals
			} as never);

			expect(welcomeMock.sendWelcome).toHaveBeenCalledWith(newUser);
			expect(result).toMatchObject({ form: { message: { type: 'success' } } });
		});

		it('refuses when the user is still not allowlisted', async () => {
			welcomeMock.isEmailAllowlisted.mockReturnValue(false);

			const result = await actions.sendWelcomeEmail({
				request: post({ id: 'u-new' }),
				locals: adminLocals
			} as never);

			expect(welcomeMock.sendWelcome).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 400 });
		});

		it('rejects a non-admin caller', async () => {
			const result = await actions.sendWelcomeEmail({
				request: post({ id: 'u-new' }),
				locals: { user: { id: 'u-3', role: 'user' } } as App.Locals
			} as never);

			expect(getUserMock).not.toHaveBeenCalled();
			expect(result).toMatchObject({ status: 403 });
		});
	});
});
