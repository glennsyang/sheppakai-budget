import { budgetSchema } from '$lib/formSchemas';
import { createAction, updateAction } from '$lib/server/actions/crud-helpers';
import { budgetQueries, recurringQueries, transactionQueries } from '$lib/server/db/queries';
import { budget } from '$lib/server/db/schema';
import { logger } from '$lib/server/logger';
import { getMonthYearFromUrl, padMonth } from '$lib/utils/dates';
import type { z } from 'zod';

import type { Actions, PageServerLoad } from './$types';

// Helper function to calculate a month range ending at the selected month/year
type MonthEntry = { month: string; year: string; date: Date };

function getLastMonthsRange(
	currentMonth: number,
	currentYear: number,
	count: number
): MonthEntry[] {
	const months: MonthEntry[] = [];

	for (let i = count - 1; i >= 0; i--) {
		// Calculate target month and year, handling negative months
		let targetMonth = currentMonth - i;
		let targetYear = currentYear;

		// Handle month underflow (going into previous year)
		while (targetMonth <= 0) {
			targetMonth += 12;
			targetYear -= 1;
		}

		// Use noon UTC to avoid timezone issues during serialization
		// Midnight UTC is the previous evening in Pacific time, so noon UTC stays on the correct calendar day
		const targetDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 12, 0, 0));

		months.push({
			month: padMonth(targetMonth.toString()),
			year: targetYear.toString(),
			date: targetDate
		});
	}

	return months;
}

export const load: PageServerLoad = async ({ url }) => {
	// Get month and year from URL params or use current month/year
	const { month, year } = getMonthYearFromUrl(url);

	// Calculate date range for last 12 months (UI can filter to last 3/6/12)
	const last12Months = getLastMonthsRange(month, year, 12);
	const earliestMonth = last12Months[0];
	const latestMonth = last12Months.at(-1) ?? earliestMonth;

	// Calculate start and end dates for transaction filtering
	const startDate = `${earliestMonth.year}-${earliestMonth.month}-01`;
	const endDate = new Date(Number(latestMonth.year), Number(latestMonth.month), 0);
	const endDateStr = `${latestMonth.year}-${latestMonth.month}-${padMonth(endDate.getDate().toString())}`;

	try {
		// Fetch historical budgets for the chart window
		const historicalBudgets = await budgetQueries.findHistory(earliestMonth, latestMonth);

		// Fetch and aggregate transactions for the chart window
		const historicalTransactions = await transactionQueries.sumByCategoryMonth(
			startDate,
			endDateStr
		);

		return {
			budget: await budgetQueries.findByMonthYear(month, year),
			historicalBudgets,
			historicalTransactions,
			last12Months,
			recurring: await recurringQueries.findAll()
		};
	} catch (error) {
		logger.error('Failed to load budget:', error);
		return {
			budget: [],
			historicalBudgets: [],
			historicalTransactions: [],
			last12Months,
			recurring: [],
			loadError: 'Failed to load budget. Please try refreshing the page.'
		};
	}
};

const budgetActionConfig = {
	schema: budgetSchema,
	table: budget,
	entityName: 'Budget',
	messages: {
		createSuccess: 'Budget saved successfully',
		updateSuccess: 'Budget saved successfully'
	},
	transformCreate: (data: z.infer<typeof budgetSchema>, userId: string) => ({
		amount: data.amount,
		year: data.year,
		month: data.month,
		presetType: data.presetType || null,
		categoryId: data.categoryId,
		userId
	}),
	transformUpdate: (data: z.infer<typeof budgetSchema>) => ({
		amount: data.amount,
		year: data.year,
		month: data.month,
		presetType: data.presetType || null,
		categoryId: data.categoryId
	})
};

export const actions = {
	create: createAction(budgetActionConfig),
	update: updateAction(budgetActionConfig)
} satisfies Actions;
