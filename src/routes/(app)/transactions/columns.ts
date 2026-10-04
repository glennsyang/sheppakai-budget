import type { Transaction } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { badgeCell, categoryCell, moneyCell } from '$lib/components/table/cells';
import { type Features, renderComponent } from '$lib/components/ui/data-table/index.js';
import { FALLBACK_CATEGORY_COLOR } from '$lib/utils/categoryColors';
import { formatLocalTimestamp } from '$lib/utils/dates';
import type { ColumnDef } from '@tanstack/table-core';

import DataTableActions from './data-table-actions.svelte';

export function createColumns(
	categoryColors: Map<string, string>
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
			accessorKey: 'category',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Category',
					onclick: column.getToggleSortingHandler()
				}),
			accessorFn: (row) => row.category?.name,
			cell: ({ row }) => {
				const category = row.original.category;
				return categoryCell(
					category?.name ?? 'Uncategorized',
					(category && categoryColors.get(category.id)) || FALLBACK_CATEGORY_COLOR
				);
			},
			meta: { mobile: 'detail' }
		},
		{
			accessorKey: 'notes',
			header: 'Notes',
			cell: ({ row }) => row.original.notes,
			meta: { mobile: 'detail' }
		},
		{
			id: 'excluded',
			header: '',
			enableHiding: false,
			accessorFn: (row) => (row.excludedFromBudget ? 'Excluded' : ''),
			cell: ({ row }) =>
				row.original.excludedFromBudget
					? badgeCell({
							label: 'Excluded',
							tone: 'muted',
							title: 'Not counted in budget totals'
						})
					: '',
			meta: { mobile: 'subvalue', width: 'w-24' }
		},
		{
			accessorKey: 'amount',
			header: ({ column }) =>
				renderComponent(DataTableSortButton, {
					columnName: 'Amount',
					onclick: column.getToggleSortingHandler()
				}),
			cell: ({ row }) => moneyCell(Number(row.original.amount)),
			meta: { mobile: 'value', align: 'end' }
		},
		{
			id: 'actions',
			cell: ({ row }) =>
				renderComponent(DataTableActions, {
					id: row.original.id,
					transactionData: row.original
				})
		}
	];
}
