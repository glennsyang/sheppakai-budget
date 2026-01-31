<script lang="ts">
	import { goto } from '$app/navigation';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import TimeRangeInOut from '$lib/components/TimeRangeInOut.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getCategoriesContext } from '$lib/contexts';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let loading: boolean = $state(false);

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

	function onViewChange(value: string | undefined) {
		if (!value) return;
		goto(`?view=${value}&year=${data.year}`, { keepFocus: true, replaceState: true });
	}

	function onYearChange(value: string | undefined) {
		if (!value) return;
		goto(`?view=${data.view}&year=${value}`, { keepFocus: true, replaceState: true });
	}

	let plannedExpenses: number = $derived(data.plannedExpensesTotal || 0);

	// Sort categories alphabetically
	let sortedCategories = $derived([...categories()].sort((a, b) => a.name.localeCompare(b.name)));

	function getPlannedAmount(categoryId: string): number {
		return data.yearlyBudgets?.find((b) => b.categoryId === categoryId)?.amount || 0;
	}

	function getActualAmount(categoryId: string): number {
		if (!data.actualExpenses) return 0;

		return data.actualExpenses
			.filter((e) => e?.category?.id === categoryId)
			.reduce((sum, e) => sum + e.amount, 0);
	}

	// Generate year options (2025-2026)
	const yearOptions = [
		{ label: '2025', value: '2025' },
		{ label: '2026', value: '2026' }
	];

	let viewLabel = $derived(data.view === 'current' ? 'Last 6 Months' : 'Full Year');
	let timeRangeDescription = $derived(
		data.view === 'current' ? `Last 6 Months of ${data.year}` : `Full Year ${data.year}`
	);
</script>

<svelte:head>
	<title>Yearly Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Yearly Dashboard</h1>
				<p class="mt-2 text-muted-foreground">Annual overview of your budget and expenses</p>
			</div>
			<div class="flex gap-4">
				<!-- Year Selector -->
				<div class="w-32">
					<Select.Root type="single" value={data.year?.toString()} onValueChange={onYearChange}>
						<Select.Trigger class="w-full">
							{data.year}
						</Select.Trigger>
						<Select.Content>
							<Select.Label>Select Year</Select.Label>
							{#each yearOptions as yearOption (yearOption.value)}
								<Select.Item value={yearOption.value} label={yearOption.label}>
									{yearOption.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- View Toggle -->
				<Tabs.Root value={data.view} onValueChange={onViewChange} class="w-100">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="current">Last 6 Months</Tabs.Trigger>
						<Tabs.Trigger value="full">Full Year</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
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

	<!-- Time Range Chart -->
	<div class="mt-6">
		<TimeRangeInOut
			chartTitle="{viewLabel} In & Out"
			chartDescription="Overview of {timeRangeDescription.toLowerCase()}"
			chartData={data.timeRangeData}
		/>
	</div>
</div>

<!-- Transaction Details Sheet -->
<CategoryTransactionSheet
	bind:open={openTransactionSheet}
	transactions={filteredTransactions}
	category={selectedCategory}
	timeRange={timeRangeDescription}
/>
