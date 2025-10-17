<script lang="ts">
	import type { PageProps } from './$types';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import type { Income } from '$lib';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { months } from '$lib/utils';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	const currentMonth = (new Date().getMonth() + 1).toString();
	const currentYear = new Date().getFullYear();

	let selectedMonth = $derived(page.url.searchParams.get('month') ?? currentMonth);

	function onMonthChange(month: string | undefined) {
		goto(`?month=${month}&year=${currentYear}`, { keepFocus: true, replaceState: true });
	}
</script>

<svelte:head>
	<title>All Income - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">All Income</h1>
				<p class="mt-2 text-muted-foreground">Complete list of all your recorded income</p>
			</div>
			<div class="w-44">
				<Select.Root type="single" value={selectedMonth} onValueChange={onMonthChange}>
					<Select.Trigger class="w-full">
						{selectedMonth ? months.find((m) => m.value === selectedMonth)?.label : 'Select Month'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Jump to Month</Select.Label>
						{#each months as month (month.value)}
							<Select.Item value={month.value} label={month.label}>
								{month.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
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
				<DataTable {columns} data={data.income as Income[]} />
			{/if}
		</div>
	</div>
</div>

<IncomeModal bind:open={openModal} bind:isLoading={loading} />
