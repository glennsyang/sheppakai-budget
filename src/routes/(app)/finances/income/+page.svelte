<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import * as Select from '$lib/components/ui/select/index.js';
	import { months } from '$lib/utils';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`${resolve('/finances/income')}?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`${resolve('/finances/income')}?month=${month}&year=${selectedYear}`, {
				keepFocus: true,
				replaceState: true
			});
		}
	}
</script>

<svelte:head>
	<title>Income</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-4">
				<div>
					<MonthYearSwitcher
						currentMonth={selectedMonth}
						currentYear={selectedYear}
						onMonthChange={onMonthYearChange}
					/>
				</div>
			</div>
			<div class="w-44">
				<Select.Root type="single" value={selectedMonth.toString()} onValueChange={onMonthJump}>
					<Select.Trigger class="w-full">
						{months.find((m) => m.value === selectedMonth.toString())?.label || 'Jump to Month'}
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
				<div>
					<h1 class="text-3xl font-bold tracking-tight">Income</h1>
					<p class="mt-2 text-muted-foreground">Manage your income sources</p>
				</div>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openModal = true)}>
						<PlusIcon />
						Add
					</Button>
				</div>
			</div>
			{#if loading}
				<TableSkeleton rows={5} columns={3} />
			{:else}
				<DataTable {columns} data={data.incomes} />
			{/if}
		</div>
	</div>
</div>

<IncomeModal bind:open={openModal} bind:isLoading={loading} />
