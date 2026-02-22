import { formatCurrency } from '$lib/utils';

import type { Category } from '$lib';

// Column definitions for Sheet expenses table
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
		format: (amount: number) => `${formatCurrency(amount)}`
	}
];
