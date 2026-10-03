import type { auth } from '$lib/server/auth';
import type { QueryRow } from '$lib/server/db/queries/factory';
import type { SessionWithImpersonatedBy, UserWithRole } from 'better-auth/plugins';
import type { Component } from 'svelte';

/**
 * Base props for all modal/dialog components in the application.
 * Provides common interface for open state, data initialization, and edit mode.
 *
 * @template T - The entity type for initialData (e.g., Transaction, Income, Category)
 */
export interface BaseModalProps<T> {
	/** Controls modal visibility (bindable) */
	open: boolean;

	/** Initial data for editing mode - partial to allow creating with subset of fields */
	initialData?: Partial<T>;

	/** Whether modal is in edit mode (true) or create mode (false) */
	isEditing?: boolean;
}

// Entity types are derived from the Drizzle schema plus the relations each query object
// loads by default (`defaultRelations` in `$lib/server/db/queries`), so schema drift is a
// type error rather than a silent mismatch.

/** The signed-in user as better-auth returns it on `locals.user`. */
export type User = typeof auth.$Infer.Session.user;

export type UserWithSessions = UserWithRole & {
	sessions: SessionWithImpersonatedBy[];
};

export type Category = QueryRow<'category'>;

export type CardType = 'budget' | 'income';

export type Transaction = QueryRow<'transaction', { category: true; user: true }>;

export type Budget = QueryRow<'budget', { category: true; user: true }>;

export type Recurring = QueryRow<'recurring', { user: true }>;

export type Income = QueryRow<'income'>;

export type Savings = QueryRow<'savings', { user: true }>;

export type SavingsGoal = QueryRow<'savingsGoal', { user: true }>;

export type SavingsGoalWithProgress = SavingsGoal & {
	currentAmount: number;
	percentage: number;
};

export type Contribution = QueryRow<'contribution', { goal: true; user: true }>;

export type ChartData = {
	date: Date;
	actual: number;
	planned: number;
};

export type MonthlySpentChartData = {
	month: string;
	spent: number;
	budget?: number;
	overbudget: number;
};

export type TimeRangeInOutData = {
	month: string;
	in: number;
	out: number;
};

export type SpendingBreakdownData = {
	category: string;
	categoryId: string | null;
	amount: number;
	color: string;
};

export type ExcludedSpendCategory = {
	categoryId: string | null;
	categoryName: string;
	amount: number;
};

export type CategoryAnomaly = {
	categoryId: string;
	categoryName: string;
	currentAmount: number;
	trailingAverage: number;
	percentOver: number;
};

export type MonthlyNetflowData = {
	month: string;
	net: number;
};

export type WindowCleaningCustomer = QueryRow<'windowCleaningCustomer', { user: true }>;

export type WindowCleaningJob = QueryRow<'windowCleaningJob', { customer: true; user: true }>;

export type WindowCleaningCustomerWithStats = WindowCleaningCustomer & {
	jobs: WindowCleaningJob[];
	totalEarned: number;
	lastJobDate: string | null;
};

export type SidebarData = {
	navMain: {
		title: string;
		url?: string;
		icon?: Component;
		items?: { title: string; url: string }[];
	}[];
	navSavings: { title: string; url: string; icon?: Component }[];
	navReceipts: { title: string; url: string; icon?: Component }[];
	navWindows: { title: string; url: string; icon?: Component }[];
	navSetup: {
		title: string;
		url: string;
		icon?: Component;
		visible?(role: string): role is 'admin';
	}[];
};
