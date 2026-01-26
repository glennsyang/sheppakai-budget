import type { Icon } from '@lucide/svelte';
import type { Component } from 'svelte';

/**
 * Base props for all modal/dialog components in the application.
 * Provides common interface for open state, data initialization, and loading states.
 *
 * @template T - The entity type for initialData (e.g., Transaction, Income, Category)
 */
export interface BaseModalProps<T> {
	/** Controls modal visibility (bindable) */
	open: boolean;

	/** Modal title displayed in the dialog header */
	title?: string;

	/** Initial data for editing mode - partial to allow creating with subset of fields */
	initialData?: Partial<T>;

	/** Whether modal is in edit mode (true) or create mode (false) */
	isEditing?: boolean;

	/** Loading state for async operations (bindable) */
	isLoading?: boolean;
}

export type User = {
	id: string;
	email: string;
	name: string | null;
};

export type Category = {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	updatedAt: string;
};

export type Transaction = {
	id: string;
	amount: number;
	payee: string;
	notes: string;
	date: string;
	gstAmount?: number | null;
	category: Category | null;
	user: User;
};

export type Budget = {
	id: string;
	amount: number;
	month: string;
	year: string;
	presetType?: string | null;
	category: Category | null;
	user: User;
};

export type Recurring = {
	id: string;
	merchant: string;
	description: string;
	cadence: 'Monthly' | 'Yearly';
	amount: number;
	user: User;
};

export type Income = {
	id: string;
	name: string;
	description: string;
	amount: number;
	date: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
};

export type Savings = {
	id: string;
	title: string;
	description: string | null;
	amount: number;
	userId: string;
	user: User;
	createdAt: string;
	updatedAt: string;
};

export type SavingsGoal = {
	id: string;
	name: string;
	description: string | null;
	targetAmount: number;
	targetDate: string | null;
	status: 'active' | 'completed' | 'paused' | 'archived';
	userId: string;
	user: User;
	createdAt: string;
	updatedAt: string;
};

export type SavingsGoalWithProgress = SavingsGoal & {
	currentAmount: number;
	percentage: number;
};

export type Contribution = {
	id: string;
	goalId: string;
	amount: number;
	date: string;
	description: string | null;
	userId: string;
	goal: SavingsGoal;
	user: User;
	createdAt: string;
	updatedAt: string;
};

export type ChartData = {
	date: Date;
	actual: number;
	planned: number;
};

export type AreaChartData = {
	date: Date;
	spent: number;
};

export type BarChartData = {
	date: Date;
	spent: number;
};

export type SidebarData = {
	navMain: { title: string; url: string; icon?: Component<Icon> }[];
	navSavings: { title: string; url: string; icon?: Component<Icon> }[];
	navReceipts: { title: string; url: string; icon?: Component<Icon> }[];
	navSetup: { title: string; url: string; icon?: Component<Icon> }[];
};
