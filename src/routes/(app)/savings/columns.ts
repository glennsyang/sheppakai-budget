import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

import type { Savings } from '$lib';

export const columns: ColumnDef<Savings>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Title',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => {
			return row.original.description || '-';
		}
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Amount',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
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
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				savingsData: row.original
			});
		}
	}
];
