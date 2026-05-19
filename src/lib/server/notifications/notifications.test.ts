import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	fetch: vi.fn(),
	loggerError: vi.fn(),
	getEnv: vi.fn(() => ({
		AUTH_ALERTS_URL: 'https://alerts.example.com/auth',
		BUDGET_ALERTS_URL: 'https://alerts.example.com/budget'
	}))
}));

vi.mock('../../../env', () => ({
	getEnv: mockState.getEnv
}));

vi.mock('../logger', () => ({
	logger: {
		error: mockState.loggerError,
		info: vi.fn<() => void>()
	}
}));

// Mock global fetch before the module is imported
vi.stubGlobal('fetch', mockState.fetch);

import { sendAuthAlerts, sendBudgetAlerts } from './index';

describe('sendAuthAlerts', () => {
	beforeEach(() => {
		mockState.fetch.mockReset();
		mockState.loggerError.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns true when fetch responds ok', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		const result = await sendAuthAlerts('User signed in');
		expect(result).toBe(true);
	});

	it('posts to AUTH_ALERTS_URL', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		await sendAuthAlerts('message');
		expect(mockState.fetch).toHaveBeenCalledWith(
			'https://alerts.example.com/auth',
			expect.objectContaining({ method: 'POST', body: 'message' })
		);
	});

	it('sends correct priority and tags headers', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		await sendAuthAlerts('msg', 'Title', 5);
		const [, opts] = mockState.fetch.mock.calls[0] as [
			string,
			RequestInit & { headers: Record<string, string> }
		];
		expect(opts.headers).toMatchObject({
			Title: 'Title',
			Priority: '5',
			Tags: 'rotating_light'
		});
	});

	it('uses default title and priority when not supplied', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		await sendAuthAlerts('msg');
		const [, opts] = mockState.fetch.mock.calls[0] as [
			string,
			RequestInit & { headers: Record<string, string> }
		];
		expect(opts.headers).toMatchObject({ Title: 'App Alert', Priority: '3' });
	});

	it('returns false when response is not ok', async () => {
		mockState.fetch.mockResolvedValue({ ok: false });
		const result = await sendAuthAlerts('fail');
		expect(result).toBe(false);
	});

	it('returns false and logs error when fetch throws', async () => {
		mockState.fetch.mockRejectedValue(new Error('network error'));
		const result = await sendAuthAlerts('fail');
		expect(result).toBe(false);
		expect(mockState.loggerError).toHaveBeenCalled();
	});
});

describe('sendBudgetAlerts', () => {
	beforeEach(() => {
		mockState.fetch.mockReset();
		mockState.loggerError.mockReset();
	});

	it('returns true when fetch responds ok', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		const result = await sendBudgetAlerts('Groceries at 90%');
		expect(result).toBe(true);
	});

	it('posts to BUDGET_ALERTS_URL', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		await sendBudgetAlerts('message');
		expect(mockState.fetch).toHaveBeenCalledWith(
			'https://alerts.example.com/budget',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('uses default title when not supplied', async () => {
		mockState.fetch.mockResolvedValue({ ok: true });
		await sendBudgetAlerts('msg');
		const [, opts] = mockState.fetch.mock.calls[0] as [
			string,
			RequestInit & { headers: Record<string, string> }
		];
		expect(opts.headers).toMatchObject({ Title: 'Sheppakai - Budget Alert', Priority: '3' });
	});

	it('returns false and logs error when fetch throws', async () => {
		mockState.fetch.mockRejectedValue(new TypeError('fetch failed'));
		const result = await sendBudgetAlerts('msg');
		expect(result).toBe(false);
		expect(mockState.loggerError).toHaveBeenCalled();
	});
});
