import { goto } from '$app/navigation';
import { page } from '$app/state';

import { getCurrentPacificMonthYear, parseMonthParam, parseYearParam } from './dates';

/**
 * Reads the selected month/year from the `month` and `year` search params
 * (falling back to the current Pacific month/year) and provides the
 * navigation handlers used by the month switcher and "Jump to Month" select.
 *
 * Must be called during component initialisation, since it creates `$derived`
 * state that tracks `page.url`.
 */
export function useMonthYearParams(basePath: string) {
	const { month: defaultMonth, year: defaultYear } = getCurrentPacificMonthYear();

	const month = $derived(parseMonthParam(page.url.searchParams.get('month'), defaultMonth));
	const year = $derived(parseYearParam(page.url.searchParams.get('year'), defaultYear));

	function navigate(nextMonth: number | string, nextYear: number) {
		void goto(`${basePath}?month=${nextMonth}&year=${nextYear}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	return {
		get month() {
			return month;
		},
		get year() {
			return year;
		},
		onMonthYearChange(nextMonth: number, nextYear: number) {
			navigate(nextMonth, nextYear);
		},
		onMonthJump(nextMonth: string | undefined) {
			if (nextMonth) {
				navigate(nextMonth, year);
			}
		}
	};
}
