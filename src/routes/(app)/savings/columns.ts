import type { Savings } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { moneyCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Features, Savings>[] = [
	{
		accessorKey: 'title',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Account',
				onclick: column.getToggleSortingHandler()
			}),
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => row.original.description || '—',
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Balance',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => moneyCell(Number(row.original.amount)),
		meta: { mobile: 'value', align: 'end' }
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				id: row.original.id,
				savingsData: row.original
			})
	}
];
