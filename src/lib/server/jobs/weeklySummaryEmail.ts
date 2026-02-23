import { and, eq, inArray, ne, sql } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { budget, category, transaction, user } from '$lib/server/db/schema';
import { sendWeeklySummaryEmail, type WeeklySummaryCategory } from '$lib/server/email';
import { logger } from '$lib/server/logger';

type WeeklySummaryRunResult = {
	success: boolean;
	skipped: boolean;
	reason?: string;
	monthLabel: string;
	recipientsScanned: number;
	emailsSent: number;
	emailsFailed: number;
	overBudgetCount: number;
	nearLimitCount: number;
};

type PacificDateParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	weekday: number;
};

const PACIFIC_TIMEZONE = 'America/Los_Angeles';
const TEN_PERCENT_THRESHOLD = 0.9;

function getPacificDateParts(date: Date): PacificDateParts {
	const formatter = new Intl.DateTimeFormat('en-US', {
		timeZone: PACIFIC_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false,
		weekday: 'short'
	});

	const parts = formatter.formatToParts(date);
	const partMap = new Map(parts.map((part) => [part.type, part.value]));
	const weekdayMap: Record<string, number> = {
		Sun: 0,
		Mon: 1,
		Tue: 2,
		Wed: 3,
		Thu: 4,
		Fri: 5,
		Sat: 6
	};

	const weekdayText = partMap.get('weekday') || 'Sun';

	return {
		year: Number(partMap.get('year')),
		month: Number(partMap.get('month')),
		day: Number(partMap.get('day')),
		hour: Number(partMap.get('hour')),
		weekday: weekdayMap[weekdayText] ?? 0
	};
}

function formatMonthLabel(month: number, year: number): string {
	const labelDate = new Date(Date.UTC(year, month - 1, 1));
	return new Intl.DateTimeFormat('en-US', {
		timeZone: PACIFIC_TIMEZONE,
		month: 'long',
		year: 'numeric'
	}).format(labelDate);
}

function buildMonthRange(date: Date) {
	const pacificParts = getPacificDateParts(date);
	const month = String(pacificParts.month).padStart(2, '0');
	const day = String(pacificParts.day).padStart(2, '0');

	return {
		year: String(pacificParts.year),
		month,
		startDate: `${pacificParts.year}-${month}-01`,
		endDate: `${pacificParts.year}-${month}-${day}`,
		monthLabel: formatMonthLabel(pacificParts.month, pacificParts.year)
	};
}

function shouldRunAtScheduledPacificTime(date: Date): boolean {
	const pacificParts = getPacificDateParts(date);
	return pacificParts.weekday === 1 && pacificParts.hour === 8;
}

function toSummaryRows(params: {
	budgets: Array<{ categoryId: string; categoryName: string; amount: number }>;
	spendByCategoryId: Map<string, number>;
}): { overBudgetRows: WeeklySummaryCategory[]; nearLimitRows: WeeklySummaryCategory[] } {
	const overBudgetRows: WeeklySummaryCategory[] = [];
	const nearLimitRows: WeeklySummaryCategory[] = [];

	for (const item of params.budgets) {
		const spent = params.spendByCategoryId.get(item.categoryId) ?? 0;
		const overBy = spent - item.amount;

		if (overBy > 0) {
			overBudgetRows.push({
				categoryName: item.categoryName,
				budgetAmount: item.amount,
				spentAmount: spent,
				overByAmount: overBy
			});
			continue;
		}

		if (item.amount <= 0) {
			continue;
		}

		const thresholdAmount = item.amount * TEN_PERCENT_THRESHOLD;
		if (spent >= thresholdAmount) {
			nearLimitRows.push({
				categoryName: item.categoryName,
				budgetAmount: item.amount,
				spentAmount: spent,
				remainingAmount: Math.max(item.amount - spent, 0)
			});
		}
	}

	overBudgetRows.sort((a, b) => (b.overByAmount ?? 0) - (a.overByAmount ?? 0));
	nearLimitRows.sort((a, b) => (b.spentAmount ?? 0) - (a.spentAmount ?? 0));

	return { overBudgetRows, nearLimitRows };
}

export async function runWeeklySummaryEmail(date = new Date()): Promise<WeeklySummaryRunResult> {
	if (!shouldRunAtScheduledPacificTime(date)) {
		const monthRange = buildMonthRange(date);
		return {
			success: true,
			skipped: true,
			reason: 'Not Monday 8am Pacific time',
			monthLabel: monthRange.monthLabel,
			recipientsScanned: 0,
			emailsSent: 0,
			emailsFailed: 0,
			overBudgetCount: 0,
			nearLimitCount: 0
		};
	}

	const db = getDb();
	const monthRange = buildMonthRange(date);

	const recipients = await db
		.select({
			name: user.name,
			email: user.email
		})
		.from(user)
		.where(and(eq(user.banned, false), ne(user.email, '')));

	const monthlyBudgets = await db
		.select({
			categoryId: budget.categoryId,
			categoryName: category.name,
			amount: budget.amount
		})
		.from(budget)
		.innerJoin(category, eq(budget.categoryId, category.id))
		.where(and(eq(budget.month, monthRange.month), eq(budget.year, monthRange.year)));

	if (monthlyBudgets.length === 0) {
		logger.info('No monthly budgets found for weekly summary email run', {
			month: monthRange.month,
			year: monthRange.year
		});
		return {
			success: true,
			skipped: true,
			reason: 'No budgets found for current month',
			monthLabel: monthRange.monthLabel,
			recipientsScanned: recipients.length,
			emailsSent: 0,
			emailsFailed: 0,
			overBudgetCount: 0,
			nearLimitCount: 0
		};
	}

	const dedupedBudgetByCategory = new Map<string, { categoryName: string; amount: number }>();
	for (const row of monthlyBudgets) {
		const existing = dedupedBudgetByCategory.get(row.categoryId);
		if (!existing) {
			dedupedBudgetByCategory.set(row.categoryId, {
				categoryName: row.categoryName,
				amount: row.amount
			});
			continue;
		}
		dedupedBudgetByCategory.set(row.categoryId, {
			categoryName: row.categoryName,
			amount: existing.amount + row.amount
		});
	}

	const budgetedCategoryIds = Array.from(dedupedBudgetByCategory.keys());
	const monthTransactions =
		budgetedCategoryIds.length > 0
			? await db
					.select({
						categoryId: transaction.categoryId,
						amount: transaction.amount
					})
					.from(transaction)
					.where(
						and(
							inArray(transaction.categoryId, budgetedCategoryIds),
							sql`date(${transaction.date}) >= date(${monthRange.startDate})`,
							sql`date(${transaction.date}) <= date(${monthRange.endDate})`
						)
					)
			: [];

	const spendByCategoryId = new Map<string, number>();
	for (const txn of monthTransactions) {
		const current = spendByCategoryId.get(txn.categoryId) ?? 0;
		spendByCategoryId.set(txn.categoryId, current + txn.amount);
	}

	const budgetRows = Array.from(dedupedBudgetByCategory.entries()).map(([categoryId, value]) => ({
		categoryId,
		categoryName: value.categoryName,
		amount: value.amount
	}));

	const { overBudgetRows, nearLimitRows } = toSummaryRows({
		budgets: budgetRows,
		spendByCategoryId
	});

	let emailsSent = 0;
	let emailsFailed = 0;

	for (const recipient of recipients) {
		try {
			await sendWeeklySummaryEmail({
				to: recipient.email,
				name: recipient.name ?? 'there',
				monthLabel: monthRange.monthLabel,
				overBudgetCategories: overBudgetRows,
				nearLimitCategories: nearLimitRows
			});
			emailsSent += 1;
		} catch (error) {
			emailsFailed += 1;
			logger.error('Failed to send weekly summary email to recipient', error);
		}
	}

	logger.info('Weekly summary email run completed', {
		recipientsScanned: recipients.length,
		emailsSent,
		emailsFailed,
		overBudgetCount: overBudgetRows.length,
		nearLimitCount: nearLimitRows.length,
		monthLabel: monthRange.monthLabel
	});

	return {
		success: true,
		skipped: false,
		monthLabel: monthRange.monthLabel,
		recipientsScanned: recipients.length,
		emailsSent,
		emailsFailed,
		overBudgetCount: overBudgetRows.length,
		nearLimitCount: nearLimitRows.length
	};
}
