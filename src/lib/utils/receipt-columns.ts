import type { Transaction } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { moneyCell } from '$lib/components/table/cells';
import TransactionRowActions from '$lib/components/TransactionRowActions.svelte';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import { formatCurrency } from '$lib/utils';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';

export function createReceiptColumns(
	actionUrl: string,
	deleteMessage: string
): ColumnDef<Features, Transaction>[] {
	return [
		{
			accessorKey: 'date',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Date',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => formatLocalTimestamp(row.original.date),
			meta: { width: 'w-32' }
		},
		{
			accessorKey: 'payee',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Payee',
					onclick: column.getToggleSortingHandler()
				}),
			meta: { mobile: 'title' }
		},
		{
			accessorKey: 'notes',
			header: 'Notes',
			meta: { mobile: 'detail' }
		},
		{
			accessorKey: 'gstAmount',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'GST',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => moneyCell(row.original.gstAmount ?? 0, { muted: true }),
			meta: { align: 'end', width: 'w-28' }
		},
		{
			accessorKey: 'amount',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Amount',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => moneyCell(Number(row.original.amount)),
			meta: { mobile: 'value', align: 'end', width: 'w-32' }
		},
		{
			id: 'gstLine',
			header: 'GST',
			accessorFn: (row) => row.gstAmount ?? 0,
			cell: ({ row }) => `GST ${formatCurrency(row.original.gstAmount ?? 0)}`,
			meta: { mobile: 'subvalue', phoneOnly: true }
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(TransactionRowActions, {
					id: row.original.id,
					transactionData: row.original,
					actionUrl,
					deleteMessage
				})
		}
	];
}
