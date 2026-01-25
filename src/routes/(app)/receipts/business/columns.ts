import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';

import DataTableActions from './data-table-actions.svelte';

import type { Transaction } from '$lib';

export const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: 'date',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => {
			return formatLocalTimestamp(row.original.date);
		}
	},
	{
		accessorKey: 'payee',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Payee',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Amount',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
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
		accessorKey: 'gstAmount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'GST',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
		cell: ({ row }) => {
			const formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			});

			const gstAmountCellSnippet = createRawSnippet<[string]>((getGstAmount) => {
				const gstAmount = getGstAmount();
				return {
					render: () => `<div class="text-right font-medium">${gstAmount}</div>`
				};
			});

			const gstValue = row.original.gstAmount ?? 0;
			return renderSnippet(gstAmountCellSnippet, formatter.format(gstValue));
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				transactionData: row.original
			});
		}
	}
];
