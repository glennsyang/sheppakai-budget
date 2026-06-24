export function calculateMonthsSinceJanuary(year: number): number {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	if (year < currentYear) {
		return 12;
	} else if (year > currentYear) {
		return 0;
	} else {
		return currentDate.getMonth();
	}
}
