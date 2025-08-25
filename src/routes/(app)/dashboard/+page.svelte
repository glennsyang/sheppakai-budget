<script lang="ts">
	import type { Category } from '$lib';
	import type { PageProps } from './$types';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { incomeCategoryId, months } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	let { data }: PageProps = $props();

	const currentMonth = (new Date().getMonth() + 1).toString();
	const currentYear = new Date().getFullYear();

	let loading = $state(false);
	let selectedMonth = $derived(page.url.searchParams.get('month') ?? currentMonth);

	function onMonthChange(month: string | undefined) {
		goto(`?month=${month}&year=${currentYear}`, { keepFocus: true, replaceState: true });
	}

	let plannedExpenses: number = data.plannedExpensesTotal || 0;
	let plannedIncome: number = data.plannedIncomeTotal || 0;

	const categories = getContext('categories') as () => Category[];

	function getPlannedAmount(categoryId: string): number {
		return data.plannedExpenses?.find((b) => b?.category?.id === categoryId)?.amount || 0;
	}

	function getActualAmount(categoryId: string): number {
		if (!data.actualExpenses) return 0;

		return data.actualExpenses
			.filter((e) => e?.category?.id === categoryId)
			.reduce((sum, e) => sum + e.amount, 0);
	}
</script>

<svelte:head>
	<title>Dashboard - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p class="mt-2 text-muted-foreground">Overview of your budget and expenses</p>
			</div>
			<div class="w-44">
				<Select.Root type="single" value={selectedMonth} onValueChange={onMonthChange}>
					<Select.Trigger class="w-full">
						{selectedMonth ? months.find((m) => m.value === selectedMonth)?.label : 'Select Month'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Select Month</Select.Label>
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

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<BudgetProgressCard
			title="Income"
			planned={plannedIncome}
			actual={data.actualIncomeTotal || 0}
			{loading}
			actualLabel="Actual"
			plannedLabel="Planned"
		/>

		<BudgetProgressCard
			title="Expenses"
			planned={plannedExpenses}
			actual={data.actualExpensesTotal || 0}
			{loading}
			actualLabel="Actual"
			plannedLabel="Planned"
		/>
	</div>

	<!-- Category Expenses -->
	<h2 class="mt-8 mb-4 text-xl font-semibold">Expenses by Category</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each categories() as category}
			{#if category.id !== incomeCategoryId}
				<!-- Skip income category -->
				<BudgetProgressCard
					title={category.name}
					planned={getPlannedAmount(category.id)}
					actual={getActualAmount(category.id)}
					{loading}
					actualLabel="Spent"
					plannedLabel="Budget"
				/>
			{/if}
		{/each}
	</div>
</div>
