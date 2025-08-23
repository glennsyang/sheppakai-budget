<script lang="ts">
	import { SimpleTable } from '$lib';
	import type { Expense, Income } from '$lib';
	import type { PageProps } from './$types';
	import { expenseColumns, incomeColumns } from './columns';
	import { Button } from '$lib/components/ui/button/index.js';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { months } from '$lib/utils';

	let { data }: PageProps = $props();

	let expenses: Expense[] = data.expenses || [];
	let income: Income[] = data.income || [];
	let totalExpenses: number = data.totalExpenses || 0;
	let totalIncome: number = data.totalIncome || 0;

	// Placeholder values for planned expenses and income
	let plannedExpenses: number = 3600;
	let plannedIncome: number = 4500;

	let loading: boolean = false;

	let selectedMonth = $state('');

	// const currentYear = new Date().getFullYear();
	// const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

	// // Get current month and year from URL or set to current month
	// const urlMonth = $page.url.searchParams.get('month');
	// let selectedMonthValue = $state(
	// 	urlMonth ||
	// 		`${currentYear}-${new Date().getMonth() + 1 < 10 ? '0' : ''}${new Date().getMonth() + 1}`
	// );
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
				<Select.Root type="single" bind:value={selectedMonth}>
					<Select.Trigger class="w-full">
						{selectedMonth ? months.find((m) => m.value === selectedMonth)?.label : 'Select Month'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Select Month</Select.Label>
						{#each months as month}
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
			actual={totalIncome}
			planned={plannedIncome}
			{loading}
			actualLabel="Actual"
			plannedLabel="Planned"
		/>

		<BudgetProgressCard
			title="Expenses"
			actual={totalExpenses}
			planned={plannedExpenses}
			{loading}
			actualLabel="Actual"
			plannedLabel="Planned"
		/>
	</div>

	<!-- Recent Expenses Table -->
	<div class="mt-8 overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-medium">Recent Expenses</h2>
				<div class="flex items-center gap-2">
					<Button size="sm">
						<a href="/expense" class="text-sm">More...</a>
					</Button>
				</div>
			</div>
			<SimpleTable
				data={expenses}
				columns={expenseColumns}
				{loading}
				title=""
				caption="A list of your recent expenses."
				emptyMessage="No expenses recorded yet."
			/>
		</div>
	</div>

	<!-- Recent Income Table -->
	<div class="mt-8 overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-medium">Recent Income</h2>
				<div class="flex items-center gap-2">
					<Button size="sm">
						<a href="/income" class="text-sm">More...</a>
					</Button>
				</div>
			</div>
			<SimpleTable
				data={income}
				columns={incomeColumns}
				{loading}
				title=""
				caption="A list of your recent income."
				emptyMessage="No income recorded yet."
			/>
		</div>
	</div>
</div>
