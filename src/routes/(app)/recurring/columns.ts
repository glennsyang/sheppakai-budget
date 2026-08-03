import type { Recurring } from '$lib';
import DataTableSortButton from '$lib/components/DataTableSortButton.svelte';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

import DataTableActions from './data-table-actions.svelte';

const MONTH_ABBREVIATIONS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

function formatDueDate(recurring: Recurring): string {
	if (!recurring.dueDay) return '—';
	if (recurring.cadence === 'Yearly' && recurring.dueMonth) {
		return `${MONTH_ABBREVIATIONS[recurring.dueMonth - 1]} ${recurring.dueDay}`;
	}
	return `${recurring.dueDay}${ordinalSuffix(recurring.dueDay)}`;
}

function ordinalSuffix(day: number): string {
	if (day % 10 === 1 && day !== 11) return 'st';
	if (day % 10 === 2 && day !== 12) return 'nd';
	if (day % 10 === 3 && day !== 13) return 'rd';
	return 'th';
}

export const columns: ColumnDef<Recurring>[] = [
	{
		accessorKey: 'merchant',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Payee',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'description',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Description',
				onclick: column.getToggleSortingHandler()
			})
	},
	{
		accessorKey: 'cadence',
		header: 'Cadence'
	},
	{
		id: 'dueDate',
		header: 'Due',
		cell: ({ row }) => {
			const dueDateSnippet = createRawSnippet<[string]>((getDue) => {
				const due = getDue();
				return {
					render: () => `<div>${due}</div>`
				};
			});

			return renderSnippet(dueDateSnippet, formatDueDate(row.original));
		}
	},
	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSortButton, {
				columnName: 'Amount',
				onclick: column.getToggleSortingHandler(),
				class: 'justify-end w-full',
				iconPosition: 'right'
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
		id: 'actions',
		cell: ({ row }) => {
			// Pass both the ID and the entire recurring data for editing
			return renderComponent(DataTableActions, {
				id: row.original.id,
				recurringData: row.original
			});
		}
	}
];
