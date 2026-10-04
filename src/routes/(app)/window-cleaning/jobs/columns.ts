import type { WindowCleaningJob } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { moneyCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

export const columns: ColumnDef<Features, WindowCleaningJob>[] = [
	{
		accessorKey: 'jobDate',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Date',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => formatLocalTimestamp(row.original.jobDate),
		meta: { width: 'w-32' }
	},
	{
		id: 'customer',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Customer',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.customer?.name ?? '',
		cell: ({ row }) => row.original.customer?.name ?? '—',
		meta: { mobile: 'title' }
	},
	{
		accessorKey: 'durationHours',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Duration',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) =>
			row.original.durationHours == null ? '—' : `${row.original.durationHours}h`,
		meta: { mobile: 'detail', width: 'w-24' }
	},
	{
		accessorKey: 'notes',
		header: 'Notes',
		cell: ({ row }) => row.original.notes ?? '—',
		meta: { mobile: 'detail' }
	},
	{
		accessorKey: 'amountCharged',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Charged',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => moneyCell(row.original.amountCharged, { currency: 'CAD', muted: true }),
		meta: { align: 'end' }
	},
	{
		accessorKey: 'tip',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Tip',
				onclick: column.getToggleSortingHandler()
			}),
		cell: ({ row }) => moneyCell(row.original.tip, { currency: 'CAD', muted: true }),
		meta: { align: 'end' }
	},
	{
		id: 'total',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Total',
				onclick: column.getToggleSortingHandler()
			}),
		accessorFn: (row) => row.amountCharged + row.tip,
		cell: ({ row }) =>
			moneyCell(row.original.amountCharged + row.original.tip, { currency: 'CAD' }),
		meta: { mobile: 'value', align: 'end' }
	},
	{
		id: 'tipLine',
		header: 'Tip',
		accessorFn: (row) => (row.tip > 0 ? row.tip : ''),
		cell: ({ row }) => `incl. ${cad.format(row.original.tip)} tip`,
		meta: { mobile: 'subvalue', phoneOnly: true }
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(DataTableActions, {
				jobData: row.original
			})
	}
];
