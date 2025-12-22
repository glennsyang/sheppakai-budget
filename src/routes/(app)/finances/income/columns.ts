import type { ColumnDef } from '@tanstack/table-core';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

export type Income = {
	id: string;
	name: string;
	description: string;
	date: string;
	amount: number;
};

export const columns: ColumnDef<Income>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Name',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'description',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Description',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'date',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Amount',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			const amount = row.getValue('amount') as number;
			return `$${amount.toFixed(2)}`;
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				incomeData: row.original
			});
		}
	}
];
