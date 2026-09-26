import { beforeEach, describe, expect, it, vi } from 'vitest';

const { changePasswordMock, sendPasswordChangedEmailMock, loggerMock } = vi.hoisted(() => ({
	changePasswordMock: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
	sendPasswordChangedEmailMock: vi.fn<(...args: unknown[]) => Promise<void>>(),
	loggerMock: {
		error: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		debug: vi.fn<() => void>()
	}
}));

vi.mock('$lib/server/auth', () => ({
	auth: { api: { changePassword: changePasswordMock } }
}));

vi.mock('$lib/server/email', () => ({
	sendPasswordChangedEmail: sendPasswordChangedEmailMock
}));

vi.mock('$lib/server/logger', () => ({ logger: loggerMock }));

vi.mock('$lib/server/db', () => ({ getDb: vi.fn<() => void>() }));

import { actions } from './+page.server';

const currentUser = { id: 'user-1', name: 'Test User', email: 'user@example.com' };

function changePasswordRequest(headers: Record<string, string> = {}) {
	return new Request('https://budget.example.com/profile?/changePassword', {
		method: 'POST',
		headers,
		body: new URLSearchParams({
			currentPassword: 'old-password-123',
			newPassword: 'new-password-1234',
			confirmPassword: 'new-password-1234'
		})
	});
}

describe('profile changePassword action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		changePasswordMock.mockResolvedValue({});
		sendPasswordChangedEmailMock.mockResolvedValue(undefined);
	});

	it('reports the getClientAddress() IP, not a client-supplied X-Forwarded-For', async () => {
		const request = changePasswordRequest({
			'x-forwarded-for': '1.2.3.4',
			'x-real-ip': '1.2.3.4',
			'x-client-ip': '1.2.3.4'
		});

		await actions.changePassword({
			request,
			getClientAddress: () => '203.0.113.7',
			locals: { user: currentUser }
		} as never);

		expect(sendPasswordChangedEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({ ipAddress: '203.0.113.7' })
		);
		expect(loggerMock.info).toHaveBeenCalledWith(
			'Security event: password changed and other sessions revoked',
			expect.objectContaining({ ipAddress: '203.0.113.7' })
		);
	});

	it('still changes the password and sends the alert when getClientAddress() throws', async () => {
		const result = await actions.changePassword({
			request: changePasswordRequest(),
			getClientAddress: () => {
				throw new Error('Address header was specified with ADDRESS_HEADER but is absent');
			},
			locals: { user: currentUser }
		} as never);

		expect(changePasswordMock).toHaveBeenCalledOnce();
		expect(sendPasswordChangedEmailMock).toHaveBeenCalledWith(
			expect.objectContaining({ ipAddress: undefined })
		);
		expect(result).toMatchObject({ form: { message: { type: 'success' } } });
	});
});
