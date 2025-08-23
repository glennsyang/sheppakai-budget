<script lang="ts">
	import type { Category, Expense } from '$lib';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import type { PageProps } from './$types';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import ExpenseModal from '$lib/components/ExpenseModal.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { getContext } from 'svelte';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);

	let loading = $state(false);

	const categories = getContext('categories') as () => Category[];
</script>

<svelte:head>
	<title>All Expenses - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">All Expenses</h1>
		<p class="mt-2 text-muted-foreground">Complete list of all your recorded expenses</p>
	</div>

	<div class="overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div></div>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openModal = true)}>
						<PlusIcon />
					</Button>
				</div>
			</div>
			{#if loading}
				<TableSkeleton rows={5} columns={4} />
			{:else}
				<DataTable {columns} data={data.expenses as Expense[]} />
			{/if}
		</div>
	</div>
</div>

<ExpenseModal bind:open={openModal} bind:isLoading={loading} categories={categories()} />
