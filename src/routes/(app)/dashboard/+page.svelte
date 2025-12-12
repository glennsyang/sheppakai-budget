<script lang="ts">
	import type { Category } from '$lib';
	import type { PageProps } from './$types';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { months } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getContext } from 'svelte';

	let { data }: PageProps = $props();

	const currentMonth = (new Date().getMonth() + 1).toString();
	const currentYear = new Date().getFullYear();

	let loading: boolean = $state(false);
	let selectedMonth: string = $derived(page.url.searchParams.get('month') ?? currentMonth);
	let monthName: string = $derived(months.find((m) => m.value === selectedMonth)?.label ?? '');

	function onMonthChange(month: string | undefined) {
		goto(`?month=${month}&year=${currentYear}`, { keepFocus: true, replaceState: true });
	}

	let plannedExpenses: number = data.plannedExpensesTotal || 0;

	const categories = getContext('categories') as () => Category[];

	// Sort categories alphabetically
	let sortedCategories = $derived([...categories()].sort((a, b) => a.name.localeCompare(b.name)));

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

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-1">
		<BudgetProgressCard
			title={`Total Expenses - ${monthName}`}
			planned={plannedExpenses}
			actual={data.actualExpensesTotal || 0}
			{loading}
			label1="Budget"
			label2="Spent"
		/>
	</div>

	<!-- Category Expenses -->
	<h2 class="mt-8 mb-4 text-xl font-semibold">Expenses by Category</h2>
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedCategories as category}
			<BudgetProgressCard
				title={category.name}
				planned={getPlannedAmount(category.id)}
				actual={getActualAmount(category.id)}
				{loading}
				label1="Budget"
				label2="Spent"
			/>
		{/each}
	</div>

	<div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-1">
		<BudgetProgressCard
			title={`Income Summary - ${monthName}`}
			planned={data.totalIncome || 0}
			actual={data.actualExpensesTotal || 0}
			{loading}
			label1="Income"
			label2="Expenses"
		/>
	</div>
</div>
