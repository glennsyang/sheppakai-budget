import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';

import DataTableActions from './data-table-actions.svelte';

import type { WindowCleaningJob } from '$lib';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
	style: 'currency',
	currency: 'CAD'
});

function moneyCell(value: number, rightAlign = true) {
	const snippet = createRawSnippet<[string]>((get) => {
		const v = get();
		const cls = rightAlign ? 'text-right font-medium' : 'font-medium';
		return { render: () => `<div class="${cls}">${v}</div>` };
	});
	return renderSnippet(snippet, currencyFormatter.format(value));
}

export const columns: ColumnDef<WindowCleaningJob>[] = [
	{
		accessorKey: 'jobDate',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => formatLocalTimestamp(row.original.jobDate)
	},
	{
		id: 'customer',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Customer',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.customer?.name ?? '',
		cell: ({ row }) => row.original.customer?.name ?? '—'
	},
	{
		accessorKey: 'durationHours',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Duration',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => (row.original.durationHours == null ? '—' : `${row.original.durationHours}h`)
	},
	{
		accessorKey: 'notes',
		header: 'Notes',
		cell: ({ row }) => row.original.notes ?? '—'
	},
	{
		accessorKey: 'amountCharged',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Charged',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
		cell: ({ row }) => moneyCell(row.original.amountCharged)
	},
	{
		accessorKey: 'tip',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Tip',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
		cell: ({ row }) => (row.original.tip > 0 ? moneyCell(row.original.tip) : moneyCell(0))
	},
	{
		id: 'total',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Total',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full'
			}),
		accessorFn: (row) => row.amountCharged + row.tip,
		cell: ({ row }) => moneyCell(row.original.amountCharged + row.original.tip)
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				jobData: row.original
			})
	}
];
