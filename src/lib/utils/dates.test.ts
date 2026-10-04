import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	formatDayHeading,
	calculateMonthsSinceJanuary,
	extractDateFromTimestamp,
	filterByDateRange,
	formatDateForStorage,
	formatLocalTimestamp,
	formatTime12h,
	getCalendarYearMonthsRange,
	getCurrentPeriodDueDate,
	getCurrentUTCTimestamp,
	getDaysUntilDue,
	getMonthDateRange,
	getMonthProgress,
	getMonthRangeFromUrl,
	getMonthYearFromUrl,
	getPreviousMonthsRange,
	getTodayDate,
	getYearDateRange,
	getYearProgress,
	padMonth,
	parseMonthParam,
	parseYearParam
} from './dates';

describe('Date Utilities - Local Timezone Storage', () => {
	describe('formatDateForStorage', () => {
		beforeEach(() => {
			// Mock current time to 2026-01-15 14:30:45
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-01-15T14:30:45'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should combine date with current time', () => {
			const result = formatDateForStorage('2026-02-01');
			expect(result).toBe('2026-02-01 14:30:45');
		});

		it('should use current time components', () => {
			vi.setSystemTime(new Date('2026-03-20T09:05:03'));
			const result = formatDateForStorage('2026-03-20');
			expect(result).toBe('2026-03-20 09:05:03');
		});

		it('should pad single-digit time components', () => {
			vi.setSystemTime(new Date('2026-04-10T01:02:03'));
			const result = formatDateForStorage('2026-04-10');
			expect(result).toBe('2026-04-10 01:02:03');
		});
	});

	describe('extractDateFromTimestamp', () => {
		it('should extract date portion from timestamp', () => {
			const result = extractDateFromTimestamp('2026-02-01 15:45:32');
			expect(result).toBe('2026-02-01');
		});

		it('should handle different times', () => {
			const result = extractDateFromTimestamp('2025-12-31 23:59:59');
			expect(result).toBe('2025-12-31');
		});

		it('should handle midnight timestamps', () => {
			const result = extractDateFromTimestamp('2026-01-01 00:00:00');
			expect(result).toBe('2026-01-01');
		});
	});

	describe('formatLocalTimestamp', () => {
		it('should format timestamp as "MMM DD, YYYY" by default', () => {
			const result = formatLocalTimestamp('2026-02-01 15:45:32');
			expect(result).toBe('Feb 01, 2026');
		});

		it('should format different months correctly', () => {
			expect(formatLocalTimestamp('2026-01-15 10:00:00')).toBe('Jan 15, 2026');
			expect(formatLocalTimestamp('2026-03-31 10:00:00')).toBe('Mar 31, 2026');
			expect(formatLocalTimestamp('2026-12-25 10:00:00')).toBe('Dec 25, 2026');
		});

		it('should pad single-digit days', () => {
			const result = formatLocalTimestamp('2026-05-05 10:00:00');
			expect(result).toBe('May 05, 2026');
		});

		it('should handle end of month dates', () => {
			expect(formatLocalTimestamp('2026-02-28 10:00:00')).toBe('Feb 28, 2026');
			expect(formatLocalTimestamp('2026-01-31 10:00:00')).toBe('Jan 31, 2026');
		});

		it('should fallback to locale string for non-default format', () => {
			const result = formatLocalTimestamp('2026-02-01 15:45:32', 'LONG');
			expect(typeof result).toBe('string');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('getYearDateRange', () => {
		it('should return full year boundaries', () => {
			const result = getYearDateRange(2026);
			expect(result).toEqual({ startDate: '2026-01-01', endDate: '2026-12-31' });
		});
	});

	describe('padMonth', () => {
		it('pads single-digit numbers', () => {
			expect(padMonth(3)).toBe('03');
			expect(padMonth('7')).toBe('07');
		});

		it('keeps two-digit values unchanged', () => {
			expect(padMonth(12)).toBe('12');
			expect(padMonth('10')).toBe('10');
		});
	});

	describe('getMonthDateRange', () => {
		it('should return correct range for January', () => {
			const { startDate, endDate } = getMonthDateRange(1, 2026);
			expect(startDate).toBe('2026-01-01');
			expect(endDate).toBe('2026-01-31');
		});

		it('should return correct range for February (non-leap year)', () => {
			const { startDate, endDate } = getMonthDateRange(2, 2026);
			expect(startDate).toBe('2026-02-01');
			expect(endDate).toBe('2026-02-28');
		});

		it('should return correct range for February (leap year)', () => {
			const { startDate, endDate } = getMonthDateRange(2, 2024);
			expect(startDate).toBe('2024-02-01');
			expect(endDate).toBe('2024-02-29');
		});

		it('should return correct range for 30-day month', () => {
			const { startDate, endDate } = getMonthDateRange(4, 2026);
			expect(startDate).toBe('2026-04-01');
			expect(endDate).toBe('2026-04-30');
		});

		it('should return correct range for December', () => {
			const { startDate, endDate } = getMonthDateRange(12, 2026);
			expect(startDate).toBe('2026-12-01');
			expect(endDate).toBe('2026-12-31');
		});

		it('should pad single-digit months', () => {
			const { startDate, endDate } = getMonthDateRange(5, 2026);
			expect(startDate).toBe('2026-05-01');
			expect(endDate).toBe('2026-05-31');
		});
	});

	describe('getTodayDate', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return current date in YYYY-MM-DD format', () => {
			vi.setSystemTime(new Date('2026-01-15T14:30:45'));
			const result = getTodayDate();
			expect(result).toBe('2026-01-15');
		});

		it('should pad single-digit month and day', () => {
			vi.setSystemTime(new Date('2026-03-05T10:00:00'));
			const result = getTodayDate();
			expect(result).toBe('2026-03-05');
		});

		it('should handle end of year', () => {
			vi.setSystemTime(new Date('2025-12-31T23:59:59'));
			const result = getTodayDate();
			expect(result).toBe('2025-12-31');
		});

		it('should handle start of year', () => {
			vi.setSystemTime(new Date('2026-01-01T00:00:00'));
			const result = getTodayDate();
			expect(result).toBe('2026-01-01');
		});
	});

	describe('getCurrentUTCTimestamp', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return UTC timestamp in correct format', () => {
			vi.setSystemTime(new Date('2026-01-15T14:30:45.123Z'));
			const result = getCurrentUTCTimestamp();
			expect(result).toBe('2026-01-15 14:30:45');
		});

		it('should match SQLite current_timestamp format', () => {
			vi.setSystemTime(new Date('2026-03-20T09:05:03.456Z'));
			const result = getCurrentUTCTimestamp();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
			expect(result).toBe('2026-03-20 09:05:03');
		});
	});

	describe('getMonthYearFromUrl', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-01-20T14:30:45'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should extract both month and year from URL params', () => {
			const url = new URL('http://localhost/?month=3&year=2025');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 3, year: 2025 });
		});

		it('should use current month and year when no params provided', () => {
			const url = new URL('http://localhost/');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 1, year: 2026 });
		});

		it('should use current year when only month provided', () => {
			const url = new URL('http://localhost/?month=6');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 6, year: 2026 });
		});

		it('should use current month when only year provided', () => {
			const url = new URL('http://localhost/?year=2025');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 1, year: 2025 });
		});

		it('should parse numeric strings correctly', () => {
			const url = new URL('http://localhost/?month=12&year=2024');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 12, year: 2024 });
		});

		it('should handle different current dates', () => {
			vi.setSystemTime(new Date('2025-07-15T10:00:00'));
			const url = new URL('http://localhost/');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 7, year: 2025 });
		});

		it('should stay in the previous month across the UTC day boundary (Pacific 9pm July 31 = UTC Aug 1)', () => {
			vi.setSystemTime(new Date('2026-08-01T04:00:00Z')); // 9:00pm PDT on July 31
			const url = new URL('http://localhost/');
			const result = getMonthYearFromUrl(url);
			expect(result).toEqual({ month: 7, year: 2026 });
		});

		it.each(['abc', '0', '13', '3abc', '-1', '1.5', ''])(
			'should fall back to the current month for invalid month %j',
			(month) => {
				const url = new URL(`http://localhost/?month=${month}&year=2025`);
				expect(getMonthYearFromUrl(url)).toEqual({ month: 1, year: 2025 });
			}
		);

		it.each(['abc', '99', '10000', '1899', '2025x', ''])(
			'should fall back to the current year for invalid year %j',
			(year) => {
				const url = new URL(`http://localhost/?month=3&year=${year}`);
				expect(getMonthYearFromUrl(url)).toEqual({ month: 3, year: 2026 });
			}
		);
	});

	describe('parseMonthParam', () => {
		it('should accept 1-12 with or without a leading zero', () => {
			expect(parseMonthParam('1', 5)).toBe(1);
			expect(parseMonthParam('03', 5)).toBe(3);
			expect(parseMonthParam('12', 5)).toBe(12);
		});

		it('should return the fallback for missing or invalid values', () => {
			expect(parseMonthParam(null, 5)).toBe(5);
			expect(parseMonthParam('13', 5)).toBe(5);
			expect(parseMonthParam('00', 5)).toBe(5);
			expect(parseMonthParam(' 3', 5)).toBe(5);
			expect(parseMonthParam('1e1', 5)).toBe(5);
		});
	});

	describe('parseYearParam', () => {
		it('should accept four-digit years from 1900', () => {
			expect(parseYearParam('1900', 2026)).toBe(1900);
			expect(parseYearParam('2025', 2026)).toBe(2025);
			expect(parseYearParam('9999', 2026)).toBe(9999);
		});

		it('should return the fallback for missing or invalid values', () => {
			expect(parseYearParam(null, 2026)).toBe(2026);
			expect(parseYearParam('1899', 2026)).toBe(2026);
			expect(parseYearParam('10000', 2026)).toBe(2026);
			expect(parseYearParam('0x7e9', 2026)).toBe(2026);
			expect(parseYearParam('NaN', 2026)).toBe(2026);
		});
	});

	describe('getMonthRangeFromUrl', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-01-20T14:30:45'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return complete object with month, year, startDate, and endDate', () => {
			const url = new URL('http://localhost/?month=3&year=2025');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 3,
				year: 2025,
				startDate: '2025-03-01',
				endDate: '2025-03-31'
			});
		});

		it('should use current month/year when no params provided', () => {
			const url = new URL('http://localhost/');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 1,
				year: 2026,
				startDate: '2026-01-01',
				endDate: '2026-01-31'
			});
		});

		it('should handle February in non-leap year', () => {
			const url = new URL('http://localhost/?month=2&year=2026');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 2,
				year: 2026,
				startDate: '2026-02-01',
				endDate: '2026-02-28'
			});
		});

		it('should handle February in leap year', () => {
			const url = new URL('http://localhost/?month=2&year=2024');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 2,
				year: 2024,
				startDate: '2024-02-01',
				endDate: '2024-02-29'
			});
		});

		it('should handle December correctly', () => {
			const url = new URL('http://localhost/?month=12&year=2025');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 12,
				year: 2025,
				startDate: '2025-12-01',
				endDate: '2025-12-31'
			});
		});

		it('should never produce a NaN date range for invalid params', () => {
			const url = new URL('http://localhost/?month=abc&year=xyz');
			expect(getMonthRangeFromUrl(url)).toEqual({
				month: 1,
				year: 2026,
				startDate: '2026-01-01',
				endDate: '2026-01-31'
			});
		});

		it('should handle months with 30 days', () => {
			const url = new URL('http://localhost/?month=4&year=2026');
			const result = getMonthRangeFromUrl(url);
			expect(result).toEqual({
				month: 4,
				year: 2026,
				startDate: '2026-04-01',
				endDate: '2026-04-30'
			});
		});
	});

	describe('getPreviousMonthsRange', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-03-15T12:00:00'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('returns requested month count ending at current month', () => {
			const result = getPreviousMonthsRange(3);
			expect(result).toEqual([
				{ month: 1, year: 2026, startDate: '2026-01-01', endDate: '2026-01-31' },
				{ month: 2, year: 2026, startDate: '2026-02-01', endDate: '2026-02-28' },
				{ month: 3, year: 2026, startDate: '2026-03-01', endDate: '2026-03-31' }
			]);
		});

		it('handles year rollover when traversing backwards', () => {
			vi.setSystemTime(new Date('2026-01-20T12:00:00'));
			const result = getPreviousMonthsRange(4);
			expect(result).toEqual([
				{ month: 10, year: 2025, startDate: '2025-10-01', endDate: '2025-10-31' },
				{ month: 11, year: 2025, startDate: '2025-11-01', endDate: '2025-11-30' },
				{ month: 12, year: 2025, startDate: '2025-12-01', endDate: '2025-12-31' },
				{ month: 1, year: 2026, startDate: '2026-01-01', endDate: '2026-01-31' }
			]);
		});

		it('does not include the next month across the UTC day boundary (Pacific 9pm July 31 = UTC Aug 1)', () => {
			vi.setSystemTime(new Date('2026-08-01T04:00:00Z')); // 9:00pm PDT on July 31
			const result = getPreviousMonthsRange(2);
			expect(result).toEqual([
				{ month: 6, year: 2026, startDate: '2026-06-01', endDate: '2026-06-30' },
				{ month: 7, year: 2026, startDate: '2026-07-01', endDate: '2026-07-31' }
			]);
		});
	});

	describe('getCalendarYearMonthsRange', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2026-03-15T12:00:00'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('returns only months up to current month for current year', () => {
			const result = getCalendarYearMonthsRange(2026);
			expect(result).toEqual([
				{ month: 1, year: 2026, startDate: '2026-01-01', endDate: '2026-01-31' },
				{ month: 2, year: 2026, startDate: '2026-02-01', endDate: '2026-02-28' },
				{ month: 3, year: 2026, startDate: '2026-03-01', endDate: '2026-03-31' }
			]);
		});

		it('returns all 12 months for a past year', () => {
			const result = getCalendarYearMonthsRange(2025);
			expect(result).toHaveLength(12);
			expect(result[0]).toEqual({
				month: 1,
				year: 2025,
				startDate: '2025-01-01',
				endDate: '2025-01-31'
			});
			expect(result[11]).toEqual({
				month: 12,
				year: 2025,
				startDate: '2025-12-01',
				endDate: '2025-12-31'
			});
		});

		it('excludes August across the UTC day boundary (Pacific 9pm July 31 = UTC Aug 1)', () => {
			vi.setSystemTime(new Date('2026-08-01T04:00:00Z')); // 9:00pm PDT on July 31
			const result = getCalendarYearMonthsRange(2026);
			expect(result).toHaveLength(7);
			expect(result[6]).toEqual({
				month: 7,
				year: 2026,
				startDate: '2026-07-01',
				endDate: '2026-07-31'
			});
		});
	});

	describe('getMonthProgress', () => {
		it('returns elapsed days for the current month', () => {
			const progress = getMonthProgress(3, 2026, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toMatchObject({
				kind: 'month',
				elapsedUnits: 6,
				totalUnits: 31,
				status: 'current',
				unit: 'day'
			});
			expect(progress.percentage).toBeCloseTo((6 / 31) * 100, 6);
		});

		it('returns completed progress for a past month', () => {
			const progress = getMonthProgress(2, 2026, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toEqual({
				kind: 'month',
				elapsedUnits: 28,
				totalUnits: 28,
				percentage: 100,
				status: 'past',
				unit: 'day'
			});
		});

		it('returns zero progress for a future month', () => {
			const progress = getMonthProgress(4, 2026, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toEqual({
				kind: 'month',
				elapsedUnits: 0,
				totalUnits: 30,
				percentage: 0,
				status: 'future',
				unit: 'day'
			});
		});

		it('handles February in a leap year', () => {
			const progress = getMonthProgress(2, 2024, new Date('2024-02-29T19:00:00Z'));

			expect(progress).toEqual({
				kind: 'month',
				elapsedUnits: 29,
				totalUnits: 29,
				percentage: 100,
				status: 'current',
				unit: 'day'
			});
		});

		it('handles February in a non-leap year', () => {
			const progress = getMonthProgress(2, 2026, new Date('2026-02-14T19:00:00Z'));

			expect(progress).toMatchObject({
				kind: 'month',
				elapsedUnits: 14,
				totalUnits: 28,
				status: 'current',
				unit: 'day'
			});
			expect(progress.percentage).toBe(50);
		});

		it('uses the Pacific date when UTC has already rolled into the next month', () => {
			// 2026-03-01T03:00:00Z is still Feb 28 in Pacific time
			const reference = new Date('2026-03-01T03:00:00Z');

			expect(getMonthProgress(2, 2026, reference)).toMatchObject({
				elapsedUnits: 28,
				totalUnits: 28,
				status: 'current'
			});
			expect(getMonthProgress(3, 2026, reference).status).toBe('future');
		});
	});

	describe('formatTime12h', () => {
		it('converts midnight (00:00) to 12:00 AM', () => {
			expect(formatTime12h('00:00')).toBe('12:00 AM');
		});

		it('converts noon (12:00) to 12:00 PM', () => {
			expect(formatTime12h('12:00')).toBe('12:00 PM');
		});

		it('converts afternoon hour (13:05) to 1:05 PM', () => {
			expect(formatTime12h('13:05')).toBe('1:05 PM');
		});

		it('converts morning hour (09:30) to 9:30 AM', () => {
			expect(formatTime12h('09:30')).toBe('9:30 AM');
		});

		it('converts end of day (23:59) to 11:59 PM', () => {
			expect(formatTime12h('23:59')).toBe('11:59 PM');
		});

		it('pads single-digit minutes (08:05)', () => {
			expect(formatTime12h('08:05')).toBe('8:05 AM');
		});

		it('handles HH:MM:SS format using only HH and MM', () => {
			expect(formatTime12h('14:30:00')).toBe('2:30 PM');
		});

		it('returns null for null input', () => {
			expect(formatTime12h(null)).toBeNull();
		});

		it('returns null for undefined input', () => {
			expect(formatTime12h(undefined)).toBeNull();
		});

		it('returns null for empty string', () => {
			expect(formatTime12h('')).toBeNull();
		});

		it('returns null for invalid non-time input', () => {
			expect(formatTime12h('not-a-time')).toBeNull();
		});
	});

	describe('filterByDateRange', () => {
		const rows = [
			{ id: 'dec-31', date: '2025-12-31 23:59:59' },
			{ id: 'mar-01-midnight', date: '2026-03-01 00:00:00' },
			{ id: 'mar-15', date: '2026-03-15 12:30:00' },
			{ id: 'mar-31-late', date: '2026-03-31 23:59:59' },
			{ id: 'apr-01', date: '2026-04-01 00:00:00' },
			{ id: 'date-only', date: '2026-03-10' }
		];

		it('keeps rows within the inclusive range, including the last second of the end day', () => {
			expect(filterByDateRange(rows, '2026-03-01', '2026-03-31').map((r) => r.id)).toEqual([
				'mar-01-midnight',
				'mar-15',
				'mar-31-late',
				'date-only'
			]);
		});

		it('returns nothing for a month with no rows', () => {
			expect(filterByDateRange(rows, '2026-10-01', '2026-10-31')).toEqual([]);
		});

		it('preserves the input order', () => {
			const reversed = [...rows].reverse();
			expect(filterByDateRange(reversed, '2026-03-01', '2026-03-31').map((r) => r.id)).toEqual([
				'date-only',
				'mar-31-late',
				'mar-15',
				'mar-01-midnight'
			]);
		});
	});

	describe('calculateMonthsSinceJanuary', () => {
		it('returns 12 for a past year', () => {
			expect(calculateMonthsSinceJanuary(2025, new Date('2026-06-15T19:00:00Z'))).toBe(12);
		});

		it('returns 0 for a future year', () => {
			expect(calculateMonthsSinceJanuary(2027, new Date('2026-06-15T19:00:00Z'))).toBe(0);
		});

		it('returns the completed months for the current year', () => {
			expect(calculateMonthsSinceJanuary(2026, new Date('2026-06-15T19:00:00Z'))).toBe(5);
		});

		it('returns 0 in January', () => {
			expect(calculateMonthsSinceJanuary(2026, new Date('2026-01-20T19:00:00Z'))).toBe(0);
		});

		it('uses the Pacific month when UTC has already rolled over', () => {
			// 2026-03-01 03:00 UTC is still Feb 28 in Pacific time
			expect(calculateMonthsSinceJanuary(2026, new Date('2026-03-01T03:00:00Z'))).toBe(1);
		});

		it('uses the Pacific year when UTC has already reached New Year', () => {
			// 2027-01-01 03:00 UTC is still Dec 31, 2026 in Pacific time
			expect(calculateMonthsSinceJanuary(2026, new Date('2027-01-01T03:00:00Z'))).toBe(11);
		});
	});

	describe('getYearProgress', () => {
		it('returns elapsed days for the current year', () => {
			const progress = getYearProgress(2026, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toMatchObject({
				kind: 'year',
				elapsedUnits: 2,
				totalUnits: 12,
				status: 'current',
				unit: 'month'
			});
			expect(progress.percentage).toBeCloseTo((2 / 12) * 100, 6);
		});

		it('returns completed progress for a past year', () => {
			const progress = getYearProgress(2025, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toEqual({
				kind: 'year',
				elapsedUnits: 12,
				totalUnits: 12,
				percentage: 100,
				status: 'past',
				unit: 'month'
			});
		});

		it('returns zero progress for a future year', () => {
			const progress = getYearProgress(2027, new Date('2026-03-06T19:00:00Z'));

			expect(progress).toEqual({
				kind: 'year',
				elapsedUnits: 0,
				totalUnits: 12,
				percentage: 0,
				status: 'future',
				unit: 'month'
			});
		});

		it('uses completed months for leap years as well', () => {
			const progress = getYearProgress(2024, new Date('2024-03-01T19:00:00Z'));

			expect(progress).toMatchObject({
				kind: 'year',
				elapsedUnits: 2,
				totalUnits: 12,
				status: 'current',
				unit: 'month'
			});
			expect(progress.percentage).toBeCloseTo((2 / 12) * 100, 6);
		});

		it("uses the Pacific date on New Year's Eve when UTC has already rolled over", () => {
			// 2027-01-01T03:00:00Z is still Dec 31, 2026 in Pacific time
			const reference = new Date('2027-01-01T03:00:00Z');

			expect(getYearProgress(2026, reference)).toMatchObject({
				elapsedUnits: 11,
				status: 'current'
			});
			expect(getYearProgress(2027, reference).status).toBe('future');
		});
	});

	describe('getCurrentPeriodDueDate', () => {
		it('returns the due day in the current month for Monthly cadence', () => {
			const dueDate = getCurrentPeriodDueDate(15, null, 'Monthly', new Date('2026-03-06T12:00:00'));
			expect(dueDate).toEqual(new Date(2026, 2, 15));
		});

		it('clamps the due day to the last day of a short month', () => {
			const dueDate = getCurrentPeriodDueDate(31, null, 'Monthly', new Date('2026-02-06T12:00:00'));
			expect(dueDate).toEqual(new Date(2026, 1, 28));
		});

		it('clamps to Feb 29 in a leap year', () => {
			const dueDate = getCurrentPeriodDueDate(31, null, 'Monthly', new Date('2024-02-06T12:00:00'));
			expect(dueDate).toEqual(new Date(2024, 1, 29));
		});

		it('uses dueMonth for Yearly cadence', () => {
			const dueDate = getCurrentPeriodDueDate(15, 3, 'Yearly', new Date('2026-01-06T12:00:00'));
			expect(dueDate).toEqual(new Date(2026, 2, 15));
		});

		it('falls back to the current month for Yearly cadence when dueMonth is missing', () => {
			const dueDate = getCurrentPeriodDueDate(15, null, 'Yearly', new Date('2026-01-06T12:00:00'));
			expect(dueDate).toEqual(new Date(2026, 0, 15));
		});
	});

	describe('getDaysUntilDue', () => {
		it('returns 0 when the due date is today', () => {
			const referenceDate = new Date('2026-03-06T18:00:00');
			expect(getDaysUntilDue(new Date(2026, 2, 6), referenceDate)).toBe(0);
		});

		it('returns a positive count for a future due date', () => {
			const referenceDate = new Date('2026-03-06T12:00:00');
			expect(getDaysUntilDue(new Date(2026, 2, 15), referenceDate)).toBe(9);
		});

		it('returns a negative count for a past due date (overdue)', () => {
			const referenceDate = new Date('2026-03-15T12:00:00');
			expect(getDaysUntilDue(new Date(2026, 2, 6), referenceDate)).toBe(-9);
		});

		it('ignores the time-of-day component', () => {
			const referenceDate = new Date('2026-03-06T23:59:00');
			expect(getDaysUntilDue(new Date(2026, 2, 7, 0, 1), referenceDate)).toBe(1);
		});
	});
});

describe('formatDayHeading', () => {
	const now = new Date('2026-10-03T12:00:00');

	it('omits the year for dates in the current year', () => {
		expect(formatDayHeading('2026-10-02', now)).toBe('Fri, Oct 2');
	});

	it('adds the year for other years', () => {
		expect(formatDayHeading('2025-12-31 08:00:00', now)).toBe('Wed, Dec 31, 2025');
	});
});
