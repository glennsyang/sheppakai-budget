import type { UserWithSessions } from '$lib';
import { badgeCell, stackCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Features, UserWithSessions>[] = [
	{
		accessorKey: 'name',
		header: 'User',
		accessorFn: (row) => `${row.name ?? ''} ${row.email}`,
		cell: ({ row }) =>
			stackCell(
				row.original.name || row.original.email,
				row.original.name ? row.original.email : null
			),
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			const role = row.original.role ?? 'user';
			return badgeCell({
				label: role === 'admin' ? 'Admin' : 'User',
				tone: role === 'admin' ? 'neutral' : 'muted'
			});
		},
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'banned',
		header: 'Status',
		accessorFn: (row) => (row.banned ? 'Banned' : 'Active'),
		cell: ({ row }) =>
			row.original.banned
				? badgeCell({
						label: 'Banned',
						tone: 'negative',
						title: row.original.banReason ? `Banned: ${row.original.banReason}` : 'Banned'
					})
				: badgeCell({ label: 'Active', tone: 'muted' }),
		meta: { mobile: 'subvalue' }
	},
	{
		accessorKey: 'createdAt',
		header: 'Joined',
		cell: ({ row }) =>
			new Date(row.original.createdAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			}),
		meta: { mobile: 'detail' }
	},
	{
		id: 'actions',
		cell: ({ row }) => renderComponent(DataTableActions, { user: row.original })
	}
];
