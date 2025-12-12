import type { ColumnDef } from '@tanstack/table-core';
import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableActions from './data-table-actions.svelte';

export type Income = {
	id: string;
	name: string;
	description: string;
	date: string;
	amount: number;
};

export const columns: ColumnDef<Income>[] = [
	{
		accessorKey: 'name',
		header: 'Name'
	},
	{
		accessorKey: 'description',
		header: 'Description'
	},
	{
		accessorKey: 'date',
		header: 'Date'
	},
	{
		accessorKey: 'amount',
		header: 'Amount',
		cell: ({ row }) => {
			const amount = row.getValue('amount') as number;
			return `$${amount.toFixed(2)}`;
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id.toString(),
				incomeData: row.original
			});
		}
	}
];
