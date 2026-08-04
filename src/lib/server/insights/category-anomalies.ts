import type { CategoryAnomaly, Transaction } from '$lib/types';

// Require at least this many prior months of history before flagging anything, so a
// category with only 1-2 months on record doesn't produce a noisy "anomaly" on day one.
const MIN_PRIOR_MONTHS = 3;
// Skip categories whose trailing average is trivially small (e.g. a $5/mo category jumping
// to $8 isn't a meaningful anomaly, even though it's a large percentage change).
const MIN_BASELINE_AMOUNT = 30;
const ANOMALY_RATIO = 1.25;
const MAX_ANOMALIES = 5;

export type HistoricalMonthRange = {
	monthStart: string;
	monthEnd: string;
};

export function computeCategoryAnomalies(
	transactions: Transaction[],
	historicalMonths: HistoricalMonthRange[]
): CategoryAnomaly[] {
	if (historicalMonths.length < MIN_PRIOR_MONTHS + 1) {
		return [];
	}

	const currentRange = historicalMonths[historicalMonths.length - 1];
	const priorRanges = historicalMonths.slice(0, -1);

	const categoryTotals = new Map<string, { name: string; current: number; priorTotal: number }>();

	for (const tx of transactions) {
		if (!tx.category) continue;

		const datePart = tx.date.substring(0, 10);
		const inCurrent = datePart >= currentRange.monthStart && datePart <= currentRange.monthEnd;
		const inPrior = priorRanges.some(
			(range) => datePart >= range.monthStart && datePart <= range.monthEnd
		);

		if (!inCurrent && !inPrior) continue;

		const existing = categoryTotals.get(tx.category.id) ?? {
			name: tx.category.name,
			current: 0,
			priorTotal: 0
		};

		if (inCurrent) {
			existing.current += tx.amount;
		} else {
			existing.priorTotal += tx.amount;
		}

		categoryTotals.set(tx.category.id, existing);
	}

	const anomalies: CategoryAnomaly[] = [];

	for (const [categoryId, { name, current, priorTotal }] of categoryTotals) {
		const trailingAverage = priorTotal / priorRanges.length;

		if (trailingAverage < MIN_BASELINE_AMOUNT) continue;
		if (current <= trailingAverage * ANOMALY_RATIO) continue;

		anomalies.push({
			categoryId,
			categoryName: name,
			currentAmount: current,
			trailingAverage,
			percentOver: Math.round((current / trailingAverage - 1) * 100)
		});
	}

	return anomalies.sort((a, b) => b.percentOver - a.percentOver).slice(0, MAX_ANOMALIES);
}
