import type { Transaction } from '$lib/types';

export type TransactionSummary = {
	monthlyTotal: number;
	yearlyTotal: number;
	monthlyAverage: number | null;
};

export function calculateTransactionSummary(
	monthlyTransactions: Transaction[],
	yearlyTransactions: Transaction[],
	completedMonths: number
): TransactionSummary {
	const monthlyTotal = monthlyTransactions
		.filter((t) => !t.excludedFromBudget)
		.reduce((sum, t) => sum + t.amount, 0);

	const filteredYearly = yearlyTransactions.filter((t) => !t.excludedFromBudget);
	const yearlyTotal = filteredYearly.reduce((sum, t) => sum + t.amount, 0);

	const monthlyAverage =
		completedMonths > 0 && filteredYearly.length > 0 ? yearlyTotal / completedMonths : null;

	return { monthlyTotal, yearlyTotal, monthlyAverage };
}
