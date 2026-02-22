<script lang="ts">
	import { SvelteDate, SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BarChart from '$lib/components/BarChart.svelte';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
	import TimeRangeInOut from '$lib/components/TimeRangeInOut.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getCategoriesContext } from '$lib/contexts';
	import type { BarChartData, MonthlyCategoryTrendData, MonthlySpentChartData } from '$lib/types';
	import { monthNames, months } from '$lib/utils';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	type YearlyView = 'current' | 'full';
	type DashboardNavigationState =
		| {
				mode: 'monthly';
				month: string;
				year: string;
		  }
		| {
				mode: 'yearly';
				view: YearlyView;
				year: string;
		  };

	const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
	const currentYear = new Date().getFullYear().toString();

	function normalizeMonthValue(value: string | undefined) {
		if (!value) return currentMonth;

		const parsedMonth = Number.parseInt(value, 10);
		if (Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
			return currentMonth;
		}

		return parsedMonth.toString().padStart(2, '0');
	}

	let loading: boolean = $state(false);
	let selectedMode = $derived(page.url.searchParams.get('mode') ?? data.mode ?? 'monthly');
	let selectedMonth: string = $derived(
		normalizeMonthValue(
			page.url.searchParams.get('month') ?? data.month?.toString() ?? currentMonth
		)
	);
	let selectedYear: string = $derived(
		page.url.searchParams.get('year') ?? data.year?.toString() ?? currentYear
	);
	let yearlyView = $derived(page.url.searchParams.get('view') ?? data.view ?? 'current');

	// State for transaction drawer
	let openTransactionSheet = $state(false);
	let selectedCategoryId = $state<string | null>(null);

	const categories = getCategoriesContext();
	const dashboardPath = resolve('/dashboard');

	function buildDashboardUrl(state: DashboardNavigationState) {
		if (state.mode === 'monthly') {
			return `${dashboardPath}?mode=monthly&month=${state.month}&year=${state.year}`;
		}

		return `${dashboardPath}?mode=yearly&view=${state.view}&year=${state.year}`;
	}

	function navigateDashboard(state: DashboardNavigationState) {
		goto(buildDashboardUrl(state), {
			keepFocus: true,
			replaceState: true
		});
	}

	// Derived values for transaction drawer
	let filteredTransactions = $derived(
		selectedCategoryId
			? (data.actualExpenses || [])
					.filter((t) => t?.category?.id === selectedCategoryId)
					.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			: []
	);

	let chartData: BarChartData[] = $derived.by(() => {
		const month = parseInt(selectedMonth);
		const year = parseInt(selectedYear);

		// Get the number of days in the month
		const lastDay = new Date(year, month, 0);
		const daysInMonth = lastDay.getDate();

		// Create a map of date strings to amounts
		const dataMap = (data.actualExpenses || []).reduce(
			(acc, transaction) => {
				// Extract the day portion and add 1 day to it to account for timezone issues
				const dateObj = new SvelteDate(transaction.date);
				dateObj.setDate(dateObj.getDate() + 1);
				const adjustedDateKey = dateObj.toISOString().split('T')[0];
				if (!acc[adjustedDateKey]) {
					acc[adjustedDateKey] = 0;
				}
				acc[adjustedDateKey] += transaction.amount;
				return acc;
			},
			{} as Record<string, number>
		);

		// Generate array for all days in the month
		const result: BarChartData[] = [];
		for (let day = 1; day <= daysInMonth; day++) {
			// Format day with leading zero if needed
			const dayStr = day.toString().padStart(2, '0');
			const monthStr = month.toString().padStart(2, '0');
			const dateStr = `${year}-${monthStr}-${dayStr}`;

			result.push({
				date: new Date(dateStr),
				spent: dataMap[dateStr] || 0
			});
		}

		return result;
	});

	let selectedCategory = $derived(
		selectedCategoryId ? categories().find((c) => c.id === selectedCategoryId) : null
	);

	function openCategoryDetails(categoryId: string) {
		selectedCategoryId = categoryId;
		openTransactionSheet = true;
	}

	function onModeChange(mode: string | undefined) {
		if (!mode) return;

		if (mode === 'yearly') {
			navigateDashboard({
				mode: 'yearly',
				view: yearlyView as YearlyView,
				year: selectedYear
			});
			return;
		}

		navigateDashboard({
			mode: 'monthly',
			month: selectedMonth,
			year: selectedYear
		});
	}

	function onMonthChange(month: string | undefined) {
		if (!month) return;

		navigateDashboard({
			mode: 'monthly',
			month,
			year: selectedYear
		});
	}

	function onYearChange(year: string | undefined) {
		if (!year) return;

		if (selectedMode === 'yearly') {
			navigateDashboard({
				mode: 'yearly',
				view: yearlyView as YearlyView,
				year
			});
			return;
		}

		navigateDashboard({
			mode: 'monthly',
			month: selectedMonth,
			year
		});
	}

	function onYearlyViewChange(view: string | undefined) {
		if (!view) return;
		navigateDashboard({
			mode: 'yearly',
			view: view as YearlyView,
			year: selectedYear
		});
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

	function getCategoryMonthlyData(categoryId: string) {
		if (!data.timeRangeData || !data.actualExpenses) return [];

		const monthlySpending = new SvelteMap<string, number>();

		data.timeRangeData.forEach((item) => {
			monthlySpending.set(item.month, 0);
		});

		const monthsInRange = data.timeRangeData.map((item) => item.month);

		data.actualExpenses
			.filter((expense) => expense?.category?.id === categoryId)
			.forEach((expense) => {
				const expenseDate = new Date(expense.date);
				const monthIndex = expenseDate.getMonth();
				const monthName = monthNames[monthIndex];

				if (monthsInRange.includes(monthName)) {
					const currentTotal = monthlySpending.get(monthName) || 0;
					monthlySpending.set(monthName, currentTotal + expense.amount);
				}
			});

		return data.timeRangeData.map((item) => ({
			month: item.month,
			spent: monthlySpending.get(item.month) || 0
		}));
	}

	function getCategoryTrendData(
		categoryMonthlyData: MonthlySpentChartData[]
	): MonthlyCategoryTrendData | null {
		if (categoryMonthlyData.length === 0) return null;

		const latestMonthData = categoryMonthlyData[categoryMonthlyData.length - 1];
		const monthLabel = latestMonthData.month;

		if (categoryMonthlyData.length < 2) {
			return {
				direction: latestMonthData.spent > 0 ? 'new' : 'flat',
				value: null,
				monthLabel
			};
		}

		const previousMonthData = categoryMonthlyData[categoryMonthlyData.length - 2];

		if (previousMonthData.spent === 0) {
			return {
				direction: latestMonthData.spent > 0 ? 'new' : 'flat',
				value: null,
				monthLabel
			};
		}

		const delta = latestMonthData.spent - previousMonthData.spent;

		if (delta === 0) {
			return {
				direction: 'flat',
				value: null,
				monthLabel
			};
		}

		const percentChange = (delta / Math.abs(previousMonthData.spent)) * 100;

		return {
			direction: percentChange > 0 ? 'up' : 'down',
			value: Math.abs(percentChange),
			monthLabel
		};
	}

	const yearOptions = [
		{ label: '2025', value: '2025' },
		{ label: '2026', value: '2026' }
	];

	let yearlyViewLabel = $derived(yearlyView === 'current' ? 'Last 6 Months' : 'Full Year');
	let timeRangeDescription = $derived(
		yearlyView === 'current' ? `Last 6 Months of ${selectedYear}` : `Full Year ${selectedYear}`
	);
	let categoryFooterRangeText = $derived(
		yearlyView === 'current' ? 'Total spend for the last 6 months' : 'Total spend for the full year'
	);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div class="lg:pt-1">
				<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
				<p class="mt-2 text-muted-foreground">Overview of your budget and expenses</p>
			</div>
			<div class="w-full lg:ml-auto lg:w-136">
				<div class="grid gap-3">
					<div class="flex justify-end gap-3">
						{#if selectedMode === 'monthly'}
							<div class="w-44">
								<Select.Root type="single" value={selectedMonth} onValueChange={onMonthChange}>
									<Select.Trigger class="w-full">
										{selectedMonth
											? months.find((m) => m.value === selectedMonth)?.label
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
						{:else}
							<div class="w-32">
								<Select.Root type="single" value={selectedYear} onValueChange={onYearChange}>
									<Select.Trigger class="w-full">
										{selectedYear}
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
						{/if}

						<Tabs.Root value={selectedMode} onValueChange={onModeChange} class="w-60">
							<Tabs.List class="grid w-full grid-cols-2">
								<Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
								<Tabs.Trigger value="yearly">Yearly</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					</div>

					<div class="flex min-h-10 justify-end">
						{#if selectedMode === 'yearly'}
							<Tabs.Root value={yearlyView} onValueChange={onYearlyViewChange} class="w-104">
								<Tabs.List class="grid w-full grid-cols-2">
									<Tabs.Trigger value="current">Last 6 Months</Tabs.Trigger>
									<Tabs.Trigger value="full">Full Year</Tabs.Trigger>
								</Tabs.List>
							</Tabs.Root>
						{:else}
							<div class="w-104" aria-hidden="true"></div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if selectedMode === 'monthly'}
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

		<div class="mt-6">
			<BarChart
				chartTitle="Daily Spending Trend"
				chartDescription="Showing daily spending trend for the month"
				{chartData}
			/>
		</div>
	{:else}
		<div class="mt-6">
			<TimeRangeInOut
				chartTitle={yearlyViewLabel + ' In & Out'}
				chartDescription={'Overview of ' + timeRangeDescription.toLowerCase()}
				chartData={data.timeRangeData}
			/>
		</div>

		<h2 class="mt-8 mb-4 text-xl font-semibold">Spent by Category</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each sortedCategories as category (category.id)}
				{@const categoryMonthlyData = getCategoryMonthlyData(category.id)}
				<MonthlyCategoryChart
					chartTitle={category?.name}
					chartDescription={'Monthly spending breakdown for ' + category?.name}
					chartData={categoryMonthlyData}
					trendData={getCategoryTrendData(categoryMonthlyData)}
					footerRangeText={categoryFooterRangeText}
				/>
			{/each}
		</div>
	{/if}
</div>

{#if selectedMode === 'monthly'}
	<CategoryTransactionSheet
		bind:open={openTransactionSheet}
		transactions={filteredTransactions}
		category={selectedCategory}
		month={selectedMonth}
		year={parseInt(selectedYear)}
	/>
{/if}
