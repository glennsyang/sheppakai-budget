import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

import type { UserWithSessions } from '$lib';

export const columns: ColumnDef<UserWithSessions>[] = [
	{
		accessorKey: 'email',
		header: 'Email'
	},
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return row.original.name || '-';
		}
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			const roleSnippet = createRawSnippet<[string]>((getRole) => {
				const role = getRole();
				const badgeClass =
					role === 'admin'
						? 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
						: 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
				return {
					render: () => `<span class="${badgeClass}">${role}</span>`
				};
			});

			return renderSnippet(roleSnippet, row.original.role ?? 'user');
		}
	},
	{
		accessorKey: 'banned',
		header: 'Status',
		cell: ({ row }) => {
			const statusSnippet = createRawSnippet<[{ banned: boolean; banReason: string | null }]>(
				(getStatus) => {
					const { banned, banReason } = getStatus();
					if (banned) {
						const title = banReason ? `Banned: ${banReason}` : 'Banned';
						return {
							render: () =>
								`<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" title="${title}">Banned</span>`
						};
					}
					return {
						render: () =>
							'<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</span>'
					};
				}
			);

			return renderSnippet(statusSnippet, {
				banned: row.original.banned ?? false,
				banReason: row.original.banReason ?? ''
			});
		}
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		cell: ({ row }) => {
			return new Date(row.original.createdAt).toLocaleDateString();
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				user: row.original
			});
		}
	}
];
