import type { Transaction } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import RowActions from '$lib/components/RowActions.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

const currencyFormatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
});

function makeCurrencyCell(value: number) {
	const snippet = createRawSnippet<[string]>((getValue) => {
		const formatted = getValue();
		return { render: () => `<div class="text-right font-medium">${formatted}</div>` };
	});
	return renderSnippet(snippet, currencyFormatter.format(value));
}

export function createReceiptColumns(
	actionUrl: string,
	deleteMessage: string
): ColumnDef<Transaction>[] {
	return [
		{
			accessorKey: 'date',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Date',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => formatLocalTimestamp(row.original.date)
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
			cell: ({ row }) => makeCurrencyCell(Number.parseFloat(row.getValue('amount')))
		},
		{
			accessorKey: 'gstAmount',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'GST',
					onclick: column.getToggleSortingHandler(),
					class: 'justify-end w-full'
				}),
			cell: ({ row }) => makeCurrencyCell(row.original.gstAmount ?? 0)
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(RowActions, {
					id: row.original.id,
					transactionData: row.original,
					actionUrl,
					deleteMessage
				})
		}
	];
}
