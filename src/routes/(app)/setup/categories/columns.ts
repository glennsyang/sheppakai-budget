import type { Category } from '$lib';
import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Category>[] = [
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
		id: 'actions',
		cell: ({ row }) => {
			// Pass both the ID and the entire category data for editing
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				categoryData: row.original
			});
		}
	}
];
