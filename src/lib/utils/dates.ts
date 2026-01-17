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
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
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
		const day = String(date.getDate()).padStart(2, '0');
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
	const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

	// Get last day of month
	const nextMonth = month === 12 ? 1 : month + 1;
	const nextYear = month === 12 ? year + 1 : year;
	const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
	const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

	return { startDate, endDate };
}

/**
 * Get current date in YYYY-MM-DD format
 * For default values in date input fields
 */
export function getTodayDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Get current UTC timestamp for audit fields
 * Matches SQLite's current_timestamp format
 */
export function getCurrentUTCTimestamp(): string {
	return new Date().toISOString().replace('T', ' ').split('.')[0];
}
