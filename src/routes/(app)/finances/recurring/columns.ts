import type { Recurring } from '$lib';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';

export const columns: ColumnDef<Recurring>[] = [
	{
		accessorKey: 'merchant',
		header: 'Merchant'
	},
	{
		accessorKey: 'description',
		header: 'Description'
	},
	{
		accessorKey: 'cadence',
		header: 'Cadence'
	},
	{
		accessorKey: 'amount',
		header: () => {
			const amountHeaderSnippet = createRawSnippet(() => ({
				render: () => `<div class="text-right">Amount</div>`
			}));
			return renderSnippet(amountHeaderSnippet, '');
		},
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

			return renderSnippet(
				amountCellSnippet,
				formatter.format(Number.parseFloat(row.getValue('amount')))
			);
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			// Pass both the ID and the entire recurring data for editing
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				recurringData: row.original
			});
		}
	}
];
