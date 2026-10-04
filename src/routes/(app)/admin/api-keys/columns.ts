import { badgeCell, stackCell, tagListCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export type AdminApiKey = {
	id: string;
	name: string | null;
	start: string | null;
	enabled: boolean;
	permissions: Record<string, string[]> | null;
	expiresAt: Date | string | null;
	createdAt: Date | string;
	lastRequest: Date | string | null;
	ownerName: string;
	ownerEmail: string;
};

function scopesFromPermissions(permissions: Record<string, string[]> | null): string[] {
	if (!permissions) return [];
	return Object.entries(permissions).flatMap(([resource, actions]) =>
		actions.map((action) => `${resource}:${action}`)
	);
}

const shortDate = (value: Date | string) =>
	new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const columns: ColumnDef<Features, AdminApiKey>[] = [
	{
		accessorKey: 'name',
		header: 'Key',
		cell: ({ row }) =>
			stackCell(
				row.original.name || '(unnamed)',
				row.original.start ? `${row.original.start}…` : null
			),
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'ownerName',
		header: 'Owner',
		cell: ({ row }) => stackCell(row.original.ownerName, row.original.ownerEmail),
		meta: { mobile: 'detail' }
	},
	{
		id: 'scopes',
		header: 'Scopes',
		cell: ({ row }) => tagListCell(scopesFromPermissions(row.original.permissions))
	},
	{
		accessorKey: 'enabled',
		header: 'Status',
		accessorFn: (row) => (row.enabled ? 'Active' : 'Disabled'),
		cell: ({ row }) =>
			badgeCell({
				label: row.original.enabled ? 'Active' : 'Disabled',
				tone: row.original.enabled ? 'muted' : 'negative'
			}),
		meta: { mobile: 'value' }
	},
	{
		accessorKey: 'expiresAt',
		header: 'Expires',
		cell: ({ row }) => (row.original.expiresAt ? shortDate(row.original.expiresAt) : 'Never')
	},
	{
		accessorKey: 'lastRequest',
		header: 'Last used',
		cell: ({ row }) => (row.original.lastRequest ? shortDate(row.original.lastRequest) : 'Never'),
		meta: { mobile: 'subvalue' }
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		cell: ({ row }) => shortDate(row.original.createdAt)
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				apiKey: row.original
			})
	}
];
