<script lang="ts">
	import type { PageProps } from './$types';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import type { Category, Budget } from '$lib';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { getContext } from 'svelte';
	import BudgetModal from '$lib/components/BudgetModal.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { months } from '$lib/utils';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`?month=${month}&year=${year}`, { keepFocus: true, replaceState: true });
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`?month=${month}&year=${selectedYear}`, { keepFocus: true, replaceState: true });
		}
	}

	const categories = getContext('categories') as () => Category[];
</script>

<svelte:head>
	<title>All Budgets - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<MonthYearSwitcher
					currentMonth={selectedMonth}
					currentYear={selectedYear}
					currentType={'Budget'}
					onMonthChange={onMonthYearChange}
				/>
			</div>
			<div class="w-44">
				<Select.Root type="single" value={selectedMonth.toString()} onValueChange={onMonthJump}>
					<Select.Trigger class="w-full">
						{selectedMonth
							? months.find((m) => m.value === selectedMonth.toString())?.label
							: 'Select Month'}
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
				<DataTable {columns} data={data.budget as Budget[]} />
			{/if}
		</div>
	</div>
</div>

<BudgetModal bind:open={openModal} bind:isLoading={loading} categories={categories()} />
