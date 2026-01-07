import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

import type { Contribution } from '$lib';

export const columns: ColumnDef<Contribution>[] = [
	{
		accessorKey: 'date',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'goal',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Goal',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.goal?.name,
		cell: ({ row }) => {
			return row.original.goal ? row.original.goal.name : 'Unknown';
		}
	},
	{
		accessorKey: 'description',
		header: 'Description',
		accessorFn: (row) => row.description || '-'
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
				contributionData: row.original
			});
		}
	}
];
