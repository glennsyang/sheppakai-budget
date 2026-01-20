/**
 * Date Utilities for Local Timezone Storage
 *
 * Storage: Local timestamps as text (YYYY-MM-DD HH:MM:SS) without UTC conversion
 * User Input: Local date (YYYY-MM-DD) → Combined with current local time
 * Display: Local timestamp → Formatted local date
 * Queries: Month range using local dates
 * Audit: created_at/updated_at still use SQLite's current_timestamp (UTC)
 */

/**
 * Format user's date input for storage with current local time
 * @param dateString - Date from HTML input (YYYY-MM-DD)
 * @returns Local timestamp string (YYYY-MM-DD HH:MM:SS)
 *
 * Example: User enters "2026-02-01" at 3:45 PM local time
 *   → Returns: "2026-02-01 15:45:32"
 */
export function formatDateForStorage(dateString: string): string {
	const now = new Date();
	const datePart = dateString;
	const hours = padMonth(String(now.getHours()));
	const minutes = padMonth(String(now.getMinutes()));
	const seconds = padMonth(String(now.getSeconds()));
	return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * Extract date portion from a local timestamp
 * @param timestamp - Local timestamp (YYYY-MM-DD HH:MM:SS)
 * @returns Date string (YYYY-MM-DD) for date inputs
 *
 * Example: "2026-02-01 15:45:32" → "2026-02-01"
 */
export function extractDateFromTimestamp(timestamp: string): string {
	return timestamp.split(' ')[0];
}

/**
 * Format local timestamp for display
 * @param timestamp - Local timestamp string (YYYY-MM-DD HH:MM:SS)
 * @param format - Output format (default: "MMM DD, YYYY")
 * @returns Formatted date string
 *
 * Example: "2026-02-01 15:45:32" → "Feb 01, 2026"
 */
export function formatLocalTimestamp(timestamp: string, format: string = 'MMM DD, YYYY'): string {
	const date = new Date(timestamp.replace(' ', 'T'));

	if (format === 'MMM DD, YYYY') {
		const month = date.toLocaleString('en-US', { month: 'short' });
		const day = padMonth(String(date.getDate()));
		const year = date.getFullYear();
		return `${month} ${day}, ${year}`;
	}

	// Fallback to localeString for other formats
	return date.toLocaleString('en-US');
}

/**
 * Get date range for a month using local dates
 * @param month - Month (1-12)
 * @param year - Year
 * @returns { startDate, endDate } as YYYY-MM-DD strings
 *
 * Example: month=2, year=2026
 *   → startDate: "2026-02-01"
 *   → endDate: "2026-02-28"
 */
export function getMonthDateRange(month: number, year: number) {
	const startDate = `${year}-${padMonth(String(month))}-01`;

	// Get last day of month
	const nextMonth = month === 12 ? 1 : month + 1;
	const nextYear = month === 12 ? year + 1 : year;
	const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
	const endDate = `${year}-${padMonth(String(month))}-${padMonth(String(lastDay))}`;

	return { startDate, endDate };
}

/**
 * Get current date in YYYY-MM-DD format
 * For default values in date input fields
 */
export function getTodayDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = padMonth(String(now.getMonth() + 1));
	const day = padMonth(String(now.getDate()));
	return `${year}-${month}-${day}`;
}

/**
 * Get current UTC timestamp for audit fields
 * Matches SQLite's current_timestamp format
 */
export function getCurrentUTCTimestamp(): string {
	return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Pad month number with leading zero
 * @param month - Month number (1-12)
 * @returns Padded month string (e.g., "03" for March)
 */
export function padMonth(month: number | string): string {
	return month.toString().padStart(2, '0');
}

/**
 * Extract month and year from URL search params with fallback to current date
 * @param url - URL object containing searchParams
 * @returns Object with month (1-12) and year
 *
 * Example: URL with ?month=3&year=2025 → { month: 3, year: 2025 }
 * Example: URL with no params → { month: 1, year: 2026 } (current date)
 */
export function getMonthYearFromUrl(url: URL): { month: number; year: number } {
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	return {
		month: monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1,
		year: yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear()
	};
}

/**
 * Extract month, year, and date range from URL search params
 * Combines getMonthYearFromUrl() with getMonthDateRange()
 * @param url - URL object containing searchParams
 * @returns Object with month, year, startDate, and endDate
 *
 * Example: URL with ?month=3&year=2025
 *   → { month: 3, year: 2025, startDate: "2025-03-01", endDate: "2025-03-31" }
 */
export function getMonthRangeFromUrl(url: URL) {
	const { month, year } = getMonthYearFromUrl(url);
	const { startDate, endDate } = getMonthDateRange(month, year);

	return { month, year, startDate, endDate };
}
