<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getCategoriesContext } from '$lib/contexts';
	import { months } from '$lib/utils';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const currentMonth = (new Date().getMonth() + 1).toString();
	const currentYear = new Date().getFullYear();

	let loading: boolean = $state(false);
	let selectedMonth: string = $derived(page.url.searchParams.get('month') ?? currentMonth);

	// State for transaction drawer
	let openTransactionSheet = $state(false);
	let selectedCategoryId = $state<string | null>(null);

	const categories = getCategoriesContext();

	// Derived values for transaction drawer
	let filteredTransactions = $derived(
		selectedCategoryId
			? (data.actualExpenses || [])
					.filter((t) => t?.category?.id === selectedCategoryId)
					.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			: []
	);

	let selectedCategory = $derived(
		selectedCategoryId ? categories().find((c) => c.id === selectedCategoryId) : null
	);

	function openCategoryDetails(categoryId: string) {
		selectedCategoryId = categoryId;
		openTransactionSheet = true;
	}

	function onMonthChange(month: string | undefined) {
		goto(`?month=${month}&year=${currentYear}`, { keepFocus: true, replaceState: true });
	}

	let plannedExpenses: number = $derived(data.plannedExpensesTotal || 0);

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
	<title>Dashboard</title>
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

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<BudgetProgressCard
			title="Budgeted"
			planned={plannedExpenses}
			actual={data.actualExpensesTotal || 0}
			{loading}
			label1="Spent"
		/>
		<BudgetProgressCard
			title="Income"
			planned={data.totalIncome || 0}
			actual={data.actualExpensesTotal || 0}
			{loading}
			label1="Expenses"
		/>
	</div>

	<!-- Category Expenses -->
	<h2 class="mt-8 mb-4 text-xl font-semibold">Expenses by Category</h2>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedCategories as category (category.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onclick={() => openCategoryDetails(category.id)}
				class="cursor-pointer transition-shadow hover:shadow-md"
			>
				<BudgetProgressCard
					title={category.name}
					planned={getPlannedAmount(category.id)}
					actual={getActualAmount(category.id)}
					{loading}
					label1="Spent"
				/>
			</div>
		{/each}
	</div>
</div>

<!-- Transaction Details Sheet -->
<CategoryTransactionSheet
	bind:open={openTransactionSheet}
	transactions={filteredTransactions}
	category={selectedCategory}
	month={selectedMonth}
	year={currentYear}
/>
