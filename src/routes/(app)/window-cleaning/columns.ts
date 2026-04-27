import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';

import DataTableActions from './data-table-actions.svelte';

import type { WindowCleaningCustomerWithStats } from '$lib';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
	style: 'currency',
	currency: 'CAD'
});

export const columns: ColumnDef<WindowCleaningCustomerWithStats>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Name',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'city',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'City',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'phoneNumber',
		header: 'Phone',
		cell: ({ row }) => row.original.phoneNumber || '—'
	},
	{
		id: 'jobCount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Jobs',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.jobs.length,
		cell: ({ row }) => row.original.jobs.length
	},
	{
		id: 'lastJobDate',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Last Visit',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.lastJobDate ?? '',
		cell: ({ row }) =>
			row.original.lastJobDate ? formatLocalTimestamp(row.original.lastJobDate) : '—'
	},
	{
		id: 'totalEarned',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Total Earned',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
		accessorFn: (row) => row.totalEarned,
		cell: ({ row }) => {
			const amountSnippet = createRawSnippet<[string]>((getAmount) => {
				const amount = getAmount();
				return { render: () => `<div class="text-right font-medium">${amount}</div>` };
			});
			return renderSnippet(amountSnippet, currencyFormatter.format(row.original.totalEarned));
		}
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				customerData: row.original
			})
	}
];
