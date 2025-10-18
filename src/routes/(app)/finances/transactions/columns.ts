import type { Transaction } from '$lib';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: 'date',
		header: 'Date'
	},
	{
		accessorKey: 'category',
		header: 'Category',
		cell: ({ row }) => {
			return row.original.category ? row.original.category.name : 'Uncategorized';
		}
	},
	{
		accessorKey: 'payee',
		header: 'Payee'
	},
	{
		accessorKey: 'amount',
		header: () => {
			const amountHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-right">Amount</div>`
			}));
			return renderSnippet(amountHeaderSnippet, '');
		},
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			});

			const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
				const amount = getAmount();
				return {
					render: () => `<div class="text-right font-medium">${amount}</div>`
				};
			});

			return renderSnippet(
				amountCellSnippet,
				formatter.format(Number.parseFloat(row.getValue('amount')))
			);
		}
	},
	{
		accessorKey: 'notes',
		header: 'Notes'
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			// Pass both the ID and the entire expense data for editing
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				transactionData: row.original
			});
		}
	}
];
