<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
	import MonthlyBudgetSummaryCard from '$lib/components/MonthlyBudgetSummaryCard.svelte';
	import MonthlyNetflowChart from '$lib/components/MonthlyNetflowChart.svelte';
	import PeriodProgressCard from '$lib/components/PeriodProgressCard.svelte';
	import SpendingBreakdownChart from '$lib/components/SpendingBreakdownChart.svelte';
	import TimeRangeInOut from '$lib/components/TimeRangeInOut.svelte';
	import { ChevronDownIcon } from '@lucide/svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getCategoriesContext } from '$lib/contexts';
	import type {
		MonthlyCategoryTrendData,
		MonthlyNetflowData,
		MonthlySpentChartData,
		SpendingBreakdownData
	} from '$lib/types';
	import { formatCurrency, monthNames, months } from '$lib/utils';
	import { getMonthProgress, getYearProgress } from '$lib/utils/dates';

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

	// Collapsible section state (collapsed by default)
	let categoriesOpen = $state(false);
	let spentByCategoryOpen = $state(false);

	// State for transaction drawer
	let openTransactionSheet = $state(false);
	let selectedCategoryId = $state<string | null>(null);

	const categories = getCategoriesContext();
	const dashboardPath = resolve('/dashboard');

	// Chart color palette (CSS variables cycle)
	const chartColors = [
		'var(--chart-1)',
		'var(--chart-2)',
		'var(--chart-3)',
		'var(--chart-4)',
		'var(--chart-5)'
	];

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

	let showOverBudgetOnly = $state(false);
	let visibleCategories = $derived(
		showOverBudgetOnly
			? sortedCategories.filter((c) => isCategoryOverBudget(c.id))
			: sortedCategories
	);

	function getPlannedAmount(categoryId: string): number {
		return data.plannedExpenses?.find((b) => b?.category?.id === categoryId)?.amount || 0;
	}

	function getActualAmount(categoryId: string): number {
		if (!data.actualExpenses) return 0;

		return data.actualExpenses
			.filter((e) => e?.category?.id === categoryId)
			.reduce((sum, e) => sum + e.amount, 0);
	}

	function isCategoryOverBudget(categoryId: string): boolean {
		const planned = getPlannedAmount(categoryId);
		if (planned <= 0) return false;

		return getActualAmount(categoryId) > planned;
	}

	// Spending breakdown donut chart data (monthly)
	let spendingBreakdownData: SpendingBreakdownData[] = $derived.by(() => {
		if (!data.actualExpenses) return [];

		const totals = new Map<string, { category: string; amount: number }>();
		for (const expense of data.actualExpenses) {
			const category = expense.category?.name ?? 'Uncategorized';
			const existing = totals.get(category);
			if (existing) {
				existing.amount += expense.amount;
			} else {
				totals.set(category, { category: category, amount: expense.amount });
			}
		}

		return [...totals.values()]
			.filter((d) => d.amount > 0)
			.sort((a, b) => b.amount - a.amount)
			.map((d, i) => ({
				...d,
				color: chartColors[i % chartColors.length]
			}));
	});

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

		// Exclude the current calendar month from trend calculations — it's still in progress
		const currentMonthName = monthNames[new Date().getMonth()];
		const completedData = categoryMonthlyData.filter((d) => d.month !== currentMonthName);

		if (completedData.length === 0) return null;

		const latestMonthData = completedData[completedData.length - 1];
		const monthLabel = latestMonthData.month;

		if (completedData.length < 2) {
			return {
				direction: latestMonthData.spent > 0 ? 'new' : 'flat',
				value: null,
				monthLabel
			};
		}

		const previousMonthData = completedData[completedData.length - 2];

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

	// Monthly netflow chart data (yearly view)
	let monthlyNetflowData: MonthlyNetflowData[] = $derived(
		(data.timeRangeData || []).map((d) => ({
			month: d.month,
			net: d.in - d.out
		}))
	);

	// YTD net balance (yearly view)
	let ytdNet = $derived((data.totalIncome || 0) - (data.actualExpensesTotal || 0));

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
	let activePeriodProgress = $derived.by(() => {
		const year = Number.parseInt(selectedYear, 10);

		if (selectedMode === 'yearly') {
			return {
				label: 'Year Progress',
				title: selectedYear,
				progress: getYearProgress(year)
			};
		}

		const month = Number.parseInt(selectedMonth, 10);

		return {
			label: 'Month Progress',
			title: `${monthNames[month - 1]} ${selectedYear}`,
			progress: getMonthProgress(month, year)
		};
	});

	let showPeriodProgress = $derived(
		selectedMode === 'yearly'
			? selectedYear === currentYear
			: selectedMonth === currentMonth && selectedYear === currentYear
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

	{#if showPeriodProgress}
		<div class="mb-6">
			<PeriodProgressCard
				label={activePeriodProgress.label}
				title={activePeriodProgress.title}
				progress={activePeriodProgress.progress}
			/>
		</div>
	{/if}

	{#if selectedMode === 'monthly'}
		<div class="mb-6">
			<MonthlyBudgetSummaryCard
				actualSpent={data.actualExpensesTotal || 0}
				plannedBudget={plannedExpenses}
				totalIncome={data.totalIncome || 0}
				{loading}
			/>
		</div>

		<div class="mb-8">
			<SpendingBreakdownChart
				chartData={spendingBreakdownData}
				totalSpent={data.actualExpensesTotal || 0}
			/>
		</div>

		<Collapsible.Root bind:open={categoriesOpen} class="mt-8">
			<div class="mb-4 flex items-center gap-3">
				<Collapsible.Trigger class="group flex cursor-pointer items-center gap-2">
					<ChevronDownIcon
						class="h-5 w-5 text-muted-foreground transition-transform duration-200 {categoriesOpen
							? ''
							: '-rotate-90'}"
					/>
					<h2 class="text-xl font-semibold">Expenses by Category</h2>
				</Collapsible.Trigger>
				<label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
					<Checkbox bind:checked={showOverBudgetOnly} />
					Over budget only
				</label>
				{#if showOverBudgetOnly}
					<span
						class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
					>
						{visibleCategories.length} over budget
					</span>
				{/if}
			</div>
			<Collapsible.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each visibleCategories as category (category.id)}
						{@const categoryOverBudget = isCategoryOverBudget(category.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							onclick={() => openCategoryDetails(category.id)}
							class={`cursor-pointer rounded-xl transition-shadow hover:shadow-md ${categoryOverBudget ? 'ring-1 ring-destructive/40' : ''}`}
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
			</Collapsible.Content>
		</Collapsible.Root>
	{:else}
		<!-- Yearly YTD KPI row -->
		<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="rounded-xl border bg-card p-4 shadow-xs">
				<p class="text-sm text-muted-foreground">YTD Income</p>
				<p class="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(data.totalIncome || 0)}</p>
			</div>
			<div class="rounded-xl border bg-card p-4 shadow-xs">
				<p class="text-sm text-muted-foreground">YTD Spent</p>
				<p class="mt-1 text-2xl font-bold tabular-nums">
					{formatCurrency(data.actualExpensesTotal || 0)}
				</p>
			</div>

			<div class="rounded-xl border bg-card p-4 shadow-xs">
				<p class="text-sm text-muted-foreground">YTD Net</p>
				<p
					class={`mt-1 text-2xl font-bold tabular-nums ${ytdNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
				>
					{ytdNet >= 0 ? '+' : ''}{formatCurrency(ytdNet)}
				</p>
			</div>
		</div>

		<div class="mb-6">
			<MonthlyNetflowChart chartData={monthlyNetflowData} />
		</div>

		<div class="mt-6">
			<TimeRangeInOut
				chartTitle={yearlyViewLabel + ' In & Out'}
				chartDescription={'Overview of ' + timeRangeDescription.toLowerCase()}
				chartData={data.timeRangeData}
			/>
		</div>

		<Collapsible.Root bind:open={spentByCategoryOpen} class="mt-8">
			<Collapsible.Trigger class="group mb-4 flex cursor-pointer items-center gap-2">
				<ChevronDownIcon
					class="h-5 w-5 text-muted-foreground transition-transform duration-200 {spentByCategoryOpen
						? ''
						: '-rotate-90'}"
				/>
				<h2 class="text-xl font-semibold">Spent by Category</h2>
			</Collapsible.Trigger>
			<Collapsible.Content>
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
			</Collapsible.Content>
		</Collapsible.Root>
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
