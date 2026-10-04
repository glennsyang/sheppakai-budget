import type { SavingsGoal } from '$lib';
import { moneyCell, stackCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Features, SavingsGoal>[] = [
	{
		accessorKey: 'name',
		header: 'Goal',
		cell: ({ row }) => stackCell(row.original.name, row.original.description),
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'user',
		header: 'Owner',
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => stackCell(row.original.user.name, row.original.user.email),
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'updatedAt',
		header: 'Archived',
		cell: ({ row }) =>
			new Date(row.original.updatedAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}),
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'targetAmount',
		header: 'Target',
		cell: ({ row }) => moneyCell(row.original.targetAmount),
		meta: { mobile: 'value', align: 'end' }
	},
	{
		id: 'actions',
		cell: ({ row }) => renderComponent(DataTableActions, { goal: row.original })
	}
];
