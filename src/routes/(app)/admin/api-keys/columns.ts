import {
	type Features,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

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
};

function scopesFromPermissions(permissions: Record<string, string[]> | null): string[] {
	if (!permissions) return [];
	return Object.entries(permissions).flatMap(([resource, actions]) =>
		actions.map((action) => `${resource}:${action}`)
	);
}

export const columns: ColumnDef<Features, AdminApiKey>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => row.original.name || '(unnamed)'
	},
	{
		accessorKey: 'start',
		header: 'Key',
		cell: ({ row }) => (row.original.start ? `${row.original.start}…` : '—')
	},
	{
		id: 'scopes',
		header: 'Scopes',
		cell: ({ row }) => {
			const scopeListSnippet = createRawSnippet<[string[]]>((getScopes) => {
				const scopes = getScopes();
				return {
					render: () =>
						scopes.length > 0
							? `<div class="flex flex-wrap gap-1">${scopes
									.map(
										(scope) =>
											`<span class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs">${scope}</span>`
									)
									.join('')}</div>`
							: '<span class="text-muted-foreground">—</span>'
				};
			});
			return renderSnippet(scopeListSnippet, scopesFromPermissions(row.original.permissions));
		}
	},
	{
		accessorKey: 'enabled',
		header: 'Status',
		cell: ({ row }) => {
			const statusSnippet = createRawSnippet<[boolean]>((getEnabled) => {
				const enabled = getEnabled();
				return {
					render: () => (enabled ? 'Active' : 'Disabled')
				};
			});
			return renderSnippet(statusSnippet, row.original.enabled);
		}
	},
	{
		accessorKey: 'expiresAt',
		header: 'Expires',
		cell: ({ row }) =>
			row.original.expiresAt ? new Date(row.original.expiresAt).toLocaleDateString() : 'Never'
	},
	{
		accessorKey: 'lastRequest',
		header: 'Last used',
		cell: ({ row }) =>
			row.original.lastRequest ? new Date(row.original.lastRequest).toLocaleDateString() : 'Never'
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				apiKey: row.original
			})
	}
];
