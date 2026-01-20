<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { setContext } from 'svelte';

	import RecurringModal from '$lib/components/RecurringModal.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	import type { Recurring } from '$lib';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	setContext('recurringForm', data.form);

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	// Calculate total recurring expenses
	let totalRecurring = $derived(
		((data.recurrings as Recurring[]) || []).reduce((sum, item) => sum + item.amount, 0)
	);
</script>

<svelte:head>
	<title>Recurring Transactions</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="flex flex-col gap-6 lg:grid lg:grid-cols-4">
		<!-- Table Column (larger) -->
		<div class="lg:col-span-3">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight">Recurring Expenses</h1>
							<p class="mt-2 text-muted-foreground">
								Manage your monthly and yearly recurring expenses
							</p>
						</div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add
							</Button>
						</div>
					</div>
					{#if loading}
						<TableSkeleton rows={5} columns={4} />
					{:else}
						<DataTable {columns} data={data.recurrings as Recurring[]} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Card Column -->
		<div class="lg:col-span-1">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Recurring Total</span>
						<span class="text-2xl font-bold">${totalRecurring.toFixed(2)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<RecurringModal bind:open={openModal} bind:isLoading={loading} recurringForm={data.form!} />
