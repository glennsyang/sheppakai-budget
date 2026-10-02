import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	goto: vi.fn<(url: string, opts?: object) => Promise<void>>(),
	page: { url: new URL('http://localhost/income') }
}));

vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$app/state', () => ({ page: mocks.page }));
vi.mock('./dates', async (importOriginal) => ({
	...(await importOriginal<typeof import('./dates')>()),
	getCurrentPacificMonthYear: () => ({ month: 9, year: 2026 })
}));

import { useMonthYearParams } from './monthYearParams.svelte';

const NAV_OPTIONS = { keepFocus: true, replaceState: true };

describe('useMonthYearParams', () => {
	beforeEach(() => {
		mocks.goto.mockReset();
		mocks.page.url = new URL('http://localhost/income');
	});

	it('falls back to the current Pacific month/year when params are missing', () => {
		const params = useMonthYearParams('/income');

		expect(params.month).toBe(9);
		expect(params.year).toBe(2026);
	});

	it('reads month and year from the search params', () => {
		mocks.page.url = new URL('http://localhost/income?month=3&year=2025');
		const params = useMonthYearParams('/income');

		expect(params.month).toBe(3);
		expect(params.year).toBe(2025);
	});

	it('falls back when params are not numeric', () => {
		mocks.page.url = new URL('http://localhost/income?month=abc&year=');
		const params = useMonthYearParams('/income');

		expect(params.month).toBe(9);
		expect(params.year).toBe(2026);
	});

	it('falls back when params are out of range or partly numeric', () => {
		mocks.page.url = new URL('http://localhost/income?month=13&year=20251');
		expect(useMonthYearParams('/income').month).toBe(9);
		expect(useMonthYearParams('/income').year).toBe(2026);

		mocks.page.url = new URL('http://localhost/income?month=3abc&year=99');
		expect(useMonthYearParams('/income').month).toBe(9);
		expect(useMonthYearParams('/income').year).toBe(2026);
	});

	it('navigates to the base path with the new month and year', () => {
		const params = useMonthYearParams('/receipts/fuel');

		params.onMonthYearChange(12, 2025);

		expect(mocks.goto).toHaveBeenCalledWith('/receipts/fuel?month=12&year=2025', NAV_OPTIONS);
	});

	it('jumps to a month within the selected year', () => {
		mocks.page.url = new URL('http://localhost/budget?month=3&year=2024');
		const params = useMonthYearParams('/budget');

		params.onMonthJump('07');

		expect(mocks.goto).toHaveBeenCalledWith('/budget?month=07&year=2024', NAV_OPTIONS);
	});

	it('ignores an empty month jump', () => {
		const params = useMonthYearParams('/budget');

		params.onMonthJump(undefined);

		expect(mocks.goto).not.toHaveBeenCalled();
	});
});
