import type { WindowCleaningCustomer } from '$lib';
import { stackCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

type DeletedCustomer = WindowCleaningCustomer & { user: { name: string; email: string } };

export const columns: ColumnDef<Features, DeletedCustomer>[] = [
	{
		accessorKey: 'name',
		header: 'Customer',
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'address',
		header: 'Address',
		cell: ({ row }) => {
			const c = row.original;
			const unit = c.unitNumber ? `, Unit ${c.unitNumber}` : '';
			return `${c.address}${unit}, ${c.city}`;
		},
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'user',
		header: 'Owner',
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => stackCell(row.original.user.name, row.original.user.email)
	},
	{
		accessorKey: 'deletedAt',
		header: 'Deleted',
		cell: ({ row }) =>
			row.original.deletedAt ? formatLocalTimestamp(row.original.deletedAt) : '—',
		meta: { mobile: 'subvalue' }
	},
	{
		id: 'actions',
		cell: ({ row }) => renderComponent(DataTableActions, { customer: row.original })
	}
];
