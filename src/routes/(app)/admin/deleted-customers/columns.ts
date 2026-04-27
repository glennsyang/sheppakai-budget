import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';

import DataTableActions from './data-table-actions.svelte';

import type { WindowCleaningCustomer } from '$lib';

type DeletedCustomer = WindowCleaningCustomer & { user: { name: string; email: string } };

export const columns: ColumnDef<DeletedCustomer>[] = [
	{
		accessorKey: 'name',
		header: 'Customer Name'
	},
	{
		accessorKey: 'address',
		header: 'Address',
		cell: ({ row }) => {
			const c = row.original;
			const unit = c.unitNumber ? `, Unit ${c.unitNumber}` : '';
			return `${c.address}${unit}, ${c.city}`;
		}
	},
	{
		accessorKey: 'user',
		header: 'Owner',
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => {
			const ownerSnippet = createRawSnippet<[{ email: string; name: string }]>((getUser) => {
				const { email, name } = getUser();
				return {
					render: () =>
						`<div><div class="font-medium">${name || email}</div><div class="text-sm text-muted-foreground">${email}</div></div>`
				};
			});
			return renderSnippet(ownerSnippet, {
				email: row.original.user.email,
				name: row.original.user.name
			});
		}
	},
	{
		accessorKey: 'deletedAt',
		header: 'Deleted',
		cell: ({ row }) => (row.original.deletedAt ? formatLocalTimestamp(row.original.deletedAt) : '—')
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				customer: row.original
			})
	}
];
