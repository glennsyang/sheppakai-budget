<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SavingsModal from '$lib/components/SavingsModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { DataTable } from '$lib/components/ui/data-table';
	import { savingsFormContext } from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		savingsFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);

	// Calculate total savings
	let totalSavings = $derived(data.savings.reduce((sum, saving) => sum + saving.amount, 0));
</script>

<svelte:head>
	<title>Savings</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="flex flex-col gap-6 lg:grid lg:grid-cols-4">
		<!-- Table Column (larger) -->
		<div class="lg:col-span-3">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight">Savings</h1>
							<p class="text-muted-foreground mt-2">Track and manage your savings accounts</p>
						</div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add
							</Button>
						</div>
					</div>
					{#if data.loadError}
						<LoadErrorBanner message={data.loadError} />
					{:else}
						<DataTable {columns} data={data.savings} />
					{/if}
				</div>
			</div>
		</div>

		{#if !data.loadError}
			<!-- Summary Card Column -->
			<div class="lg:col-span-1">
				<Card>
					<CardHeader>
						<CardTitle class="text-center text-2xl">Total Savings</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center">
							<p class="text-3xl font-bold text-green-600 dark:text-green-400">
								{formatCurrency(totalSavings)}
							</p>
							<p class="text-muted-foreground mt-2 text-sm">
								{data.savings.length}
								{data.savings.length === 1 ? 'account' : 'accounts'}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		{/if}
	</div>
</div>

<SavingsModal bind:open={openModal} savingsForm={data.form} />
