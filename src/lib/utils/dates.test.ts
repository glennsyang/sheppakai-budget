import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	extractDateFromTimestamp,
	formatDateForStorage,
	formatLocalTimestamp,
	getCurrentUTCTimestamp,
	getMonthDateRange,
	getMonthRangeFromUrl,
	getMonthYearFromUrl,
	getTodayDate
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
});
