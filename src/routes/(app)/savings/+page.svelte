<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';

	import SavingsModal from '$lib/components/SavingsModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { DataTable } from '$lib/components/ui/data-table';

	import { columns } from './columns';

	import type { Savings } from '$lib';

	interface Props {
		data: {
			savings: Savings[];
		};
	}

	let { data }: Props = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	// Calculate total savings
	let totalSavings = $derived(data.savings.reduce((sum, saving) => sum + saving.amount, 0));
</script>

<svelte:head>
	<title>Savings</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Table Column (larger) -->
		<div class="lg:col-span-3">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight">Savings</h1>
							<p class="mt-2 text-muted-foreground">
								Track and manage your savings goals and accounts
							</p>
						</div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add
							</Button>
						</div>
					</div>
					<DataTable {columns} data={data.savings} />
				</div>
			</div>
		</div>

		<!-- Summary Card Column -->
		<div class="lg:col-span-1">
			<Card>
				<CardHeader>
					<CardTitle class="text-center text-2xl">Total Savings</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-center">
						<p class="text-4xl font-bold text-green-600 dark:text-green-400">
							${totalSavings.toLocaleString('en-US', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						</p>
						<p class="mt-2 text-sm text-muted-foreground">
							{data.savings.length}
							{data.savings.length === 1 ? 'account' : 'accounts'}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>

<SavingsModal bind:open={openModal} bind:isLoading={loading} />
