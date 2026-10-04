import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { badgeCell, stackCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

export type AdminApiLogEntry = {
	id: string;
	apiKeyId: string;
	apiKeyName: string | null;
	apiKeyExists: boolean;
	userId: string;
	user: { name: string | null; email: string };
	method: string;
	path: string;
	action: string;
	statusCode: number;
	createdAt: string;
};

function formatAuditTimestamp(createdAt: string): string {
	// createdAt is written by SQLite's `current_timestamp`, which is UTC with no offset suffix.
	return new Date(`${createdAt.replace(' ', 'T')}Z`).toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

export const columns: ColumnDef<Features, AdminApiLogEntry>[] = [
	{
		accessorKey: 'createdAt',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'When',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => formatAuditTimestamp(row.original.createdAt),
		meta: { mobile: 'detail', width: 'w-40' }
	},
	{
		accessorKey: 'action',
		header: 'Action',
		meta: { mobile: 'title' }
	},
	{
		id: 'request',
		header: 'Request',
		accessorFn: (row) => `${row.method} ${row.path}`,
		cell: ({ row }) => stackCell(`${row.original.method} ${row.original.path}`, null, true),
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'user',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'User',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => row.original.user.name ?? row.original.user.email
	},
	{
		accessorKey: 'apiKeyId',
		header: 'API key',
		accessorFn: (row) => row.apiKeyName ?? row.apiKeyId,
		cell: ({ row }) =>
			row.original.apiKeyExists
				? row.original.apiKeyName || '(unnamed)'
				: stackCell(row.original.apiKeyId, 'Key no longer exists', true)
	},
	{
		accessorKey: 'statusCode',
		header: 'Status',
		cell: ({ row }) =>
			badgeCell({
				label: String(row.original.statusCode),
				tone: row.original.statusCode >= 400 ? 'negative' : 'muted'
			}),
		meta: { mobile: 'value', align: 'end', width: 'w-20' }
	}
];
