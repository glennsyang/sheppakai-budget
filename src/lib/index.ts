// place files you want to import through the `$lib` alias in this folder.

// Re-export types for easier importing
export type { User, Category, Expense, Income, Budget, DashboardSummary } from './types';

// Re-export components for easier importing
export { default as SimpleTable } from './components/SimpleTable.svelte';
