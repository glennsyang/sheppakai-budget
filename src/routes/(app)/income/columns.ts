import type { Income } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { moneyCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Features, Income>[] = [
	{
		accessorKey: 'date',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => formatLocalTimestamp(row.original.date),
		meta: { width: 'w-32' }
	},
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Source',
				onclick: column.getToggleSortingHandler()
			}),
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'description',
		header: 'Description',
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Amount',
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
				incomeData: row.original
			})
	}
];
