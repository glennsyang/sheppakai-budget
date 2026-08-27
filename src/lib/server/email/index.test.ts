import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	send: vi.fn<(payload: { html: string }) => Promise<unknown>>(),
	loggerError: vi.fn<() => void>(),
	loggerDebug: vi.fn<() => void>()
}));

vi.mock('$app/env/private', () => ({
	RESEND_API_KEY: 'test-api-key',
	RESEND_FROM_ADDRESS: 'from@example.com',
	RESEND_NEW_USER_ADDRESS: 'watcher@example.com'
}));

vi.mock('../logger', () => ({
	logger: {
		error: mockState.loggerError,
		debug: mockState.loggerDebug,
		info: vi.fn<() => void>()
	}
}));

vi.mock('resend', () => ({
	Resend: class {
		emails = { send: mockState.send };
	}
}));

import { sendNewUserEmail, sendPasswordChangedEmail, sendWeeklySummaryEmail } from './index';

function sentHtml(): string {
	const [{ html }] = mockState.send.mock.calls[0];
	return html;
}

describe('sendWeeklySummaryEmail', () => {
	beforeEach(() => {
		mockState.send.mockReset();
		mockState.send.mockResolvedValue({ data: { id: 'email-id' } });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('escapes HTML in a malicious category name', async () => {
		await sendWeeklySummaryEmail({
			to: 'user@example.com',
			name: 'Glenn',
			monthLabel: 'August 2026',
			overBudgetCategories: [
				{
					categoryName: '<img src=x onerror=alert(1)>',
					budgetAmount: 100,
					spentAmount: 150,
					overByAmount: 50
				}
			],
			nearLimitCategories: []
		});

		const html = sentHtml();
		expect(html).not.toContain('<img src=x onerror=alert(1)>');
		expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
	});

	it('escapes HTML in a malicious recipient name', async () => {
		await sendWeeklySummaryEmail({
			to: 'user@example.com',
			name: '<script>alert(1)</script>',
			monthLabel: 'August 2026',
			overBudgetCategories: [],
			nearLimitCategories: []
		});

		const html = sentHtml();
		expect(html).not.toContain('<script>alert(1)</script>');
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
	});
});

describe('sendPasswordChangedEmail', () => {
	beforeEach(() => {
		mockState.send.mockReset();
		mockState.send.mockResolvedValue({ data: { id: 'email-id' } });
	});

	it('escapes HTML in userAgent and ipAddress headers', async () => {
		await sendPasswordChangedEmail({
			to: 'user@example.com',
			name: 'Glenn',
			changedAt: new Date('2026-08-27T00:00:00Z'),
			userAgent: '<a href="https://evil.example">click me</a>',
			ipAddress: '<b>1.2.3.4</b>'
		});

		const html = sentHtml();
		expect(html).not.toContain('<a href="https://evil.example">');
		expect(html).not.toContain('<b>1.2.3.4</b>');
		expect(html).toContain('&lt;a href=&quot;https://evil.example&quot;&gt;click me&lt;/a&gt;');
		expect(html).toContain('&lt;b&gt;1.2.3.4&lt;/b&gt;');
	});

	it('renders the literal fallback text when userAgent/ipAddress are omitted', async () => {
		await sendPasswordChangedEmail({
			to: 'user@example.com',
			name: 'Glenn',
			changedAt: new Date('2026-08-27T00:00:00Z')
		});

		const html = sentHtml();
		expect(html).toContain('Unavailable');
	});
});

describe('sendNewUserEmail', () => {
	beforeEach(() => {
		mockState.send.mockReset();
		mockState.send.mockResolvedValue({ data: { id: 'email-id' } });
	});

	it('escapes HTML in a malicious display name', async () => {
		await sendNewUserEmail('user@example.com', '<script>alert(1)</script>', 'user@example.com');

		const html = sentHtml();
		expect(html).not.toContain('<script>alert(1)</script>');
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
	});
});
