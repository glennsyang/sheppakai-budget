import { and, eq, sql } from 'drizzle-orm';

import { formatCurrency } from '$lib/utils';
import { getMonthDateRange, padMonth } from '$lib/utils/dates';

import { getDb } from '../db';
import { budget, transaction } from '../db/schema';
import { logger } from '../logger';

import { sendBudgetAlerts } from './index';

const NEAR_BUDGET_THRESHOLD_RATIO = 0.9;
const NEAR_BUDGET_ALERT_PRIORITY = 3;
const OVER_BUDGET_ALERT_PRIORITY = 4;

export type BudgetThresholdState = 'below' | 'near' | 'over';
export type BudgetThresholdAlertType = 'near' | 'over';

export type TransactionBudgetAlertRecord = {
	id: string;
	userId: string;
	categoryId: string;
	amount: number;
	date: string;
};

export type TransactionBudgetAlertUpdateContext = {
	previousTransaction: TransactionBudgetAlertRecord | null;
};

type BudgetCategorySnapshot = {
	amount: number;
	categoryName: string;
};

type BudgetThresholdNotification = {
	title: string;
	message: string;
	priority: number;
};

export function getBudgetThresholdState(
	spentAmount: number,
	budgetAmount: number
): BudgetThresholdState {
	if (budgetAmount <= 0) {
		return 'below';
	}

	if (spentAmount > budgetAmount) {
		return 'over';
	}

	if (spentAmount >= budgetAmount * NEAR_BUDGET_THRESHOLD_RATIO) {
		return 'near';
	}

	return 'below';
}

export function getBudgetThresholdAlertType(
	previousState: BudgetThresholdState,
	nextState: BudgetThresholdState
): BudgetThresholdAlertType | null {
	if (nextState === previousState) {
		return null;
	}

	if (nextState === 'over' && previousState !== 'over') {
		return 'over';
	}

	if (nextState === 'near' && previousState === 'below') {
		return 'near';
	}

	return null;
}

function getMonthYearFromStoredTransactionDate(date: string): { month: number; year: number } {
	const datePart = date.split(' ')[0] ?? date;
	const [yearText, monthText] = datePart.split('-');

	return {
		year: Number.parseInt(yearText ?? '0', 10),
		month: Number.parseInt(monthText ?? '0', 10)
	};
}

function formatMonthLabel(month: number, year: number): string {
	const labelDate = new Date(Date.UTC(year, month - 1, 1));

	return new Intl.DateTimeFormat('en-US', {
		timeZone: 'UTC',
		month: 'long',
		year: 'numeric'
	}).format(labelDate);
}

function formatPercentage(spentAmount: number, budgetAmount: number): number {
	if (budgetAmount <= 0) {
		return 0;
	}

	return Math.round((spentAmount / budgetAmount) * 100);
}

function buildBudgetThresholdNotification(params: {
	alertType: BudgetThresholdAlertType;
	categoryName: string;
	spentAmount: number;
	budgetAmount: number;
	month: number;
	year: number;
}): BudgetThresholdNotification {
	const monthLabel = formatMonthLabel(params.month, params.year);
	const percentage = formatPercentage(params.spentAmount, params.budgetAmount);
	const spent = formatCurrency(params.spentAmount);
	const budgetAmount = formatCurrency(params.budgetAmount);

	if (params.alertType === 'over') {
		return {
			title: 'Category over budget',
			message: `${params.categoryName} is over the ${monthLabel} budget at ${percentage}%: ${spent} of ${budgetAmount} spent.`,
			priority: OVER_BUDGET_ALERT_PRIORITY
		};
	}

	return {
		title: 'Category at 90% of budget',
		message: `${params.categoryName} reached ${percentage}% of the ${monthLabel} budget: ${spent} of ${budgetAmount} spent.`,
		priority: NEAR_BUDGET_ALERT_PRIORITY
	};
}

async function loadBudgetCategorySnapshot(
	userId: string,
	categoryId: string,
	month: number,
	year: number
): Promise<BudgetCategorySnapshot | null> {
	const monthlyBudgets = await getDb().query.budget.findMany({
		with: {
			category: true
		},
		where: and(
			eq(budget.userId, userId),
			eq(budget.categoryId, categoryId),
			eq(budget.month, padMonth(month)),
			eq(budget.year, year.toString())
		)
	});

	if (monthlyBudgets.length === 0) {
		return null;
	}

	return {
		amount: monthlyBudgets.reduce((sum, row) => sum + row.amount, 0),
		categoryName: monthlyBudgets[0]?.category?.name ?? 'Category'
	};
}

async function loadCategoryMonthSpend(
	userId: string,
	categoryId: string,
	month: number,
	year: number
): Promise<number> {
	const { startDate, endDate } = getMonthDateRange(month, year);
	const matchingTransactions = await getDb().query.transaction.findMany({
		columns: {
			amount: true
		},
		where: and(
			eq(transaction.userId, userId),
			eq(transaction.categoryId, categoryId),
			sql`date(${transaction.date}) >= date(${startDate})`,
			sql`date(${transaction.date}) <= date(${endDate})`
		)
	});

	return matchingTransactions.reduce((sum, row) => sum + row.amount, 0);
}

async function maybeSendBudgetThresholdAlert(params: {
	userId: string;
	categoryId: string;
	month: number;
	year: number;
	previousSpentAmount: number;
	currentSpentAmount: number;
}): Promise<void> {
	const budgetSnapshot = await loadBudgetCategorySnapshot(
		params.userId,
		params.categoryId,
		params.month,
		params.year
	);

	if (!budgetSnapshot) {
		logger.info('No budget found for category threshold evaluation', {
			categoryId: params.categoryId,
			month: params.month,
			year: params.year
		});
		return;
	}

	const previousState = getBudgetThresholdState(params.previousSpentAmount, budgetSnapshot.amount);
	const nextState = getBudgetThresholdState(params.currentSpentAmount, budgetSnapshot.amount);
	const alertType = getBudgetThresholdAlertType(previousState, nextState);

	logger.info('Evaluated budget threshold transition', {
		categoryId: params.categoryId,
		month: params.month,
		year: params.year,
		previousState,
		nextState,
		previousSpentAmount: params.previousSpentAmount,
		currentSpentAmount: params.currentSpentAmount
	});

	if (!alertType) {
		return;
	}

	const notification = buildBudgetThresholdNotification({
		alertType,
		categoryName: budgetSnapshot.categoryName,
		spentAmount: params.currentSpentAmount,
		budgetAmount: budgetSnapshot.amount,
		month: params.month,
		year: params.year
	});

	const sent = await sendBudgetAlerts(
		notification.message,
		notification.title,
		notification.priority
	);

	if (!sent) {
		logger.error('Failed to send budget threshold alert', {
			categoryId: params.categoryId,
			month: params.month,
			year: params.year,
			alertType
		});
		return;
	}

	logger.info('Sent budget threshold alert', {
		categoryId: params.categoryId,
		month: params.month,
		year: params.year,
		alertType
	});
}

function mergeUpdatedTransactionRecord(
	previousTransaction: TransactionBudgetAlertRecord,
	updatedData: Partial<TransactionBudgetAlertRecord>
): TransactionBudgetAlertRecord {
	return {
		id: previousTransaction.id,
		userId: updatedData.userId ?? previousTransaction.userId,
		categoryId: updatedData.categoryId ?? previousTransaction.categoryId,
		amount: updatedData.amount ?? previousTransaction.amount,
		date: updatedData.date ?? previousTransaction.date
	};
}

export async function evaluateCreatedTransactionBudgetAlert(
	transactionRecord: TransactionBudgetAlertRecord
): Promise<void> {
	const { month, year } = getMonthYearFromStoredTransactionDate(transactionRecord.date);
	const currentSpentAmount = await loadCategoryMonthSpend(
		transactionRecord.userId,
		transactionRecord.categoryId,
		month,
		year
	);
	const previousSpentAmount = Math.max(currentSpentAmount - transactionRecord.amount, 0);

	await maybeSendBudgetThresholdAlert({
		userId: transactionRecord.userId,
		categoryId: transactionRecord.categoryId,
		month,
		year,
		previousSpentAmount,
		currentSpentAmount
	});
}

export async function buildTransactionBudgetAlertUpdateContext(
	transactionId: string
): Promise<TransactionBudgetAlertUpdateContext> {
	const previousTransaction = await getDb().query.transaction.findFirst({
		columns: {
			id: true,
			userId: true,
			categoryId: true,
			amount: true,
			date: true
		},
		where: eq(transaction.id, transactionId)
	});

	return {
		previousTransaction: previousTransaction ?? null
	};
}

export async function evaluateUpdatedTransactionBudgetAlert(
	updatedData: Partial<TransactionBudgetAlertRecord>,
	context?: TransactionBudgetAlertUpdateContext
): Promise<void> {
	const previousTransaction = context?.previousTransaction;

	if (!previousTransaction) {
		logger.error('Missing previous transaction context for budget threshold update evaluation');
		return;
	}

	const nextTransaction = mergeUpdatedTransactionRecord(previousTransaction, updatedData);
	const previousMonthYear = getMonthYearFromStoredTransactionDate(previousTransaction.date);
	const nextMonthYear = getMonthYearFromStoredTransactionDate(nextTransaction.date);
	const isSameBudgetBucket =
		previousTransaction.userId === nextTransaction.userId &&
		previousTransaction.categoryId === nextTransaction.categoryId &&
		previousMonthYear.month === nextMonthYear.month &&
		previousMonthYear.year === nextMonthYear.year;

	if (isSameBudgetBucket) {
		const currentSpentAmount = await loadCategoryMonthSpend(
			nextTransaction.userId,
			nextTransaction.categoryId,
			nextMonthYear.month,
			nextMonthYear.year
		);
		const previousSpentAmount = Math.max(
			currentSpentAmount - nextTransaction.amount + previousTransaction.amount,
			0
		);

		await maybeSendBudgetThresholdAlert({
			userId: nextTransaction.userId,
			categoryId: nextTransaction.categoryId,
			month: nextMonthYear.month,
			year: nextMonthYear.year,
			previousSpentAmount,
			currentSpentAmount
		});
		return;
	}

	const currentSpentAmount = await loadCategoryMonthSpend(
		nextTransaction.userId,
		nextTransaction.categoryId,
		nextMonthYear.month,
		nextMonthYear.year
	);
	const previousSpentAmount = Math.max(currentSpentAmount - nextTransaction.amount, 0);

	await maybeSendBudgetThresholdAlert({
		userId: nextTransaction.userId,
		categoryId: nextTransaction.categoryId,
		month: nextMonthYear.month,
		year: nextMonthYear.year,
		previousSpentAmount,
		currentSpentAmount
	});
}

export const transactionBudgetAlertHooks = {
	afterCreate: async (_id: string, data: TransactionBudgetAlertRecord) => {
		await evaluateCreatedTransactionBudgetAlert(data);
	},
	beforeUpdate: async (id: string) => {
		return buildTransactionBudgetAlertUpdateContext(id);
	},
	afterUpdate: async (
		_id: string,
		data: Partial<TransactionBudgetAlertRecord>,
		context?: TransactionBudgetAlertUpdateContext
	) => {
		await evaluateUpdatedTransactionBudgetAlert(data, context);
	}
};
