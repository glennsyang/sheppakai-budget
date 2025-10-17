import type { Category } from '$lib';

// Column definitions for expenses table
export const expenseColumns = [
	{ key: 'date', label: 'Date', width: '100px' },
	{
		key: 'category',
		label: 'Category',
		format: (category: Category) => category?.name || 'Uncategorized'
	},
	{ key: 'payee', label: 'Payee' },
	{ key: 'notes', label: 'Notes' },
	{
		key: 'amount',
		label: 'Amount',
		align: 'right' as const,
		format: (amount: number) => `$${amount.toFixed(2)}`
	}
];

// Column definitions for income table
export const incomeColumns = [
	{ key: 'date', label: 'Date', width: '100px' },
	{ key: 'description', label: 'Description' },
	{
		key: 'amount',
		label: 'Amount',
		align: 'right' as const,
		format: (amount: number) => `$${amount.toFixed(2)}`
	}
];
