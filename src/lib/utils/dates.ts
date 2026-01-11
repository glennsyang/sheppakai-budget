/**
 * Date Utilities for Multi-Timezone Shared Budget
 *
 * Storage: Full UTC timestamps as text (YYYY-MM-DD HH:MM:SS)
 * User Input: Local date (YYYY-MM-DD) → Convert to UTC timestamp at midnight local time
 * Display: UTC timestamp → User's local date
 * Queries: User's local month range → UTC timestamp range
 */

/**
 * Convert user's local date input to UTC timestamp at local midnight
 * @param localDateString - Date from HTML input (YYYY-MM-DD)
 * @returns UTC timestamp string (YYYY-MM-DD HH:MM:SS)
 *
 * Example: User in PST enters "2026-02-01"
 *   → Creates Date at Feb 1 midnight PST
 *   → Converts to UTC: "2026-02-01 08:00:00"
 */
export function localDateToUTCTimestamp(localDateString: string): string {
	const localMidnight = new Date(localDateString + 'T00:00:00');
	return localMidnight.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Convert UTC timestamp to user's local date for display or editing
 * @param utcTimestamp - UTC timestamp (YYYY-MM-DD HH:MM:SS or ISO format)
 * @returns Local date string (YYYY-MM-DD) for date inputs
 *
 * Example: UTC "2026-02-01 08:00:00"
 *   → For PST user: "2026-02-01"
 *   → For Tokyo user: "2026-02-01" (was their midnight)
 */
export function utcTimestampToLocalDate(utcTimestamp: string): string {
	const utcDate = new Date(utcTimestamp.replace(' ', 'T') + 'Z');
	const year = utcDate.getFullYear();
	const month = String(utcDate.getMonth() + 1).padStart(2, '0');
	const day = String(utcDate.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * Get current date as UTC timestamp at local midnight
 * For default values in forms
 */
export function getCurrentLocalDateAsUTC(): string {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return today.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Get current UTC timestamp for audit fields
 * Matches SQLite's current_timestamp format
 */
export function getCurrentUTCTimestamp(): string {
	return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Format UTC timestamp as local date for display
 * @param utcTimestamp - UTC timestamp string
 * @param options - Intl.DateTimeFormat options
 */
export function formatUTCTimestampAsLocalDate(
	utcTimestamp: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const date = new Date(utcTimestamp.replace(' ', 'T') + 'Z');
	return date.toLocaleDateString(
		'en-US',
		options || {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}
	);
}

/**
 * Format UTC timestamp with time for audit trail display
 */
export function formatUTCTimestampFull(
	utcTimestamp: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const date = new Date(utcTimestamp.replace(' ', 'T') + 'Z');
	return date.toLocaleString(
		'en-US',
		options || {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}
	);
}

/**
 * Get UTC timestamp range for a month in user's local timezone
 * @param month - Month (1-12)
 * @param year - Year
 * @returns { startUTC, endUTC } timestamps
 *
 * Example: User in PST queries February 2026
 *   → startUTC: "2026-02-01 08:00:00" (Feb 1 midnight PST)
 *   → endUTC: "2026-03-01 08:00:00" (Mar 1 midnight PST)
 */
export function getLocalMonthAsUTCRange(month: number, year: number) {
	// Start of month at midnight local time
	const startLocal = new Date(year, month - 1, 1);
	const startUTC = startLocal.toISOString().replace('T', ' ').split('.')[0];

	// Start of next month at midnight local time
	const endLocal = new Date(year, month, 1);
	const endUTC = endLocal.toISOString().replace('T', ' ').split('.')[0];

	return { startUTC, endUTC };
}

/**
 * Validate date string format
 */
export function isValidDateString(dateString: string): boolean {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(dateString)) return false;
	const date = new Date(dateString);
	return !Number.isNaN(date.getTime());
}
