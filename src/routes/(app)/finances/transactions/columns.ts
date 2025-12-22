import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import type { Transaction } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: 'date',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'category',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Category',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			return row.original.category ? row.original.category.name : 'Uncategorized';
		}
	},
	{
		accessorKey: 'payee',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Payee',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'notes',
		header: 'Notes'
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
