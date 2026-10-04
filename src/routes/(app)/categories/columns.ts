import type { Category } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { categoryCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export function createColumns(
	categoryColors: Map<string, string>
): ColumnDef<Features, Category>[] {
	return [
		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Name',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => categoryCell(row.original.name, categoryColors.get(row.original.id)),
			meta: { mobile: 'title', width: 'w-64' }
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => row.original.description || '—',
			meta: { mobile: 'detail' }
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(DataTableActions, {
					id: row.original.id,
					categoryData: row.original
				})
		}
	];
}
