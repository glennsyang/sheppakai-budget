<script lang="ts">
	import type { Expense } from '$lib';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let expenses: Expense[] = data.expenses || [];
</script>

<svelte:head>
	<title>All Expenses - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">All Expenses</h1>
		<p class="mt-2 text-muted-foreground">Complete list of all your recorded expenses</p>
	</div>

	<div class="overflow-hidden rounded-lg border bg-white shadow">
		<div class="p-6">
			<DataTable data={expenses} {columns} />
		</div>
	</div>
</div>
