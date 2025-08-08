<script lang="ts">
	import type { PageProps } from './$types';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import type { Income } from '$lib';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import IncomeModal from '$lib/components/IncomeModal.svelte';

	let { data }: PageProps = $props();

	let income: Income[] = data.income || [];
	let openIncomeModal = $state<boolean>(false);
</script>

<svelte:head>
	<title>All Income - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">All Income</h1>
		<p class="mt-2 text-muted-foreground">Complete list of all your recorded income</p>
	</div>

	<div class="overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div></div>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openIncomeModal = true)}>
						<PlusIcon />
					</Button>
				</div>
			</div>
			<DataTable data={income} {columns} />
		</div>
	</div>
</div>

<IncomeModal bind:open={openIncomeModal} />
