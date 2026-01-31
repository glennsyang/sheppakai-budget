// place files you want to import through the `$lib` alias in this folder.

// Re-export types for easier importing
export type {
	BaseModalProps,
	Budget,
	Category,
	ChartData,
	Contribution,
	Income,
	Recurring,
	Savings,
	SavingsGoal,
	SavingsGoalWithProgress,
	Session,
	Transaction,
	User,
	UserWithSessions
} from './types';

// Re-export components for easier importing
export { default as CategoryTransactionSheet } from './components/CategoryTransactionSheet.svelte';
export { default as SimpleTable } from './components/SimpleTable.svelte';
