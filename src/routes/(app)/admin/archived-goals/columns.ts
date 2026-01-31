import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';

import DataTableActions from './data-table-actions.svelte';

import type { SavingsGoal } from '$lib';

export const columns: ColumnDef<SavingsGoal>[] = [
	{
		accessorKey: 'name',
		header: 'Goal Name'
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => {
			return row.original.description || '-';
		}
	},
	{
		accessorKey: 'targetAmount',
		header: 'Target Amount',
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			});

			const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
				const amount = getAmount();
				return {
					render: () => `<div class="text-right font-medium">${amount}</div>`
				};
			});

			return renderSnippet(amountCellSnippet, formatter.format(row.original.targetAmount));
		}
	},
	{
		accessorKey: 'user',
		header: 'Owner',
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => {
			const userSnippet = createRawSnippet<[{ email: string; name: string | null }]>((getUser) => {
				const { email, name } = getUser();
				return {
					render: () =>
						`<div><div class="font-medium">${name || email}</div><div class="text-sm text-muted-foreground">${email}</div></div>`
				};
			});

			return renderSnippet(userSnippet, {
				email: row.original.user.email,
				name: row.original.user.name
			});
		}
	},
	{
		accessorKey: 'updatedAt',
		header: 'Archived Date',
		cell: ({ row }) => {
			return new Date(row.original.updatedAt).toLocaleDateString();
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				goal: row.original
			});
		}
	}
];
