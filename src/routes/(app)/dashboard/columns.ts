import type { Category, User } from '$lib';

// Column definitions for expenses table
export const expenseColumns = [
	{ key: 'date', label: 'Date', width: '100px' },
	{
		key: 'user',
		label: 'Entered By',
		format: (user: User) => user?.firstName || 'Unknown User'
	},
	{
		key: 'category',
		label: 'Category',
		format: (category: Category) => category?.name || 'Uncategorized'
	},
	{ key: 'description', label: 'Description' },
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
	{
		key: 'user',
		label: 'Entered By',
		format: (user: User) => user?.firstName || 'Unknown User'
	},
	{
		key: 'category',
		label: 'Category',
		format: (category: Category) => category?.name || 'Uncategorized'
	},
	{ key: 'description', label: 'Description' },
	{
		key: 'amount',
		label: 'Amount',
		align: 'right' as const,
		format: (amount: number) => `$${amount.toFixed(2)}`
	}
];
