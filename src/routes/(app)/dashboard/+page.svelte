<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import BudgetAlertRow from '$lib/components/BudgetAlertRow.svelte';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CashFlowProjectionCard from '$lib/components/CashFlowProjectionCard.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import GoalsSummaryStrip from '$lib/components/GoalsSummaryStrip.svelte';
	import KpiSparklineCard from '$lib/components/KpiSparklineCard.svelte';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
	import MonthlyBudgetSummaryCard from '$lib/components/MonthlyBudgetSummaryCard.svelte';
	import MonthlyNetflowChart from '$lib/components/MonthlyNetflowChart.svelte';
	import RecurringExpensesCard from '$lib/components/RecurringExpensesCard.svelte';
	import SpendingBreakdownChart from '$lib/components/SpendingBreakdownChart.svelte';
	import SpendingTrendLineChart from '$lib/components/SpendingTrendLineChart.svelte';
	import TimeRangeInOut from '$lib/components/TimeRangeInOut.svelte';
	import WindowCleaningSummaryCard from '$lib/components/WindowCleaningSummaryCard.svelte';
	import { ChevronDownIcon, InfoIcon } from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
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

	// Collapsible state
	let categoriesOpen = $state(false);
	let spentByCategoryOpen = $state(false);

	// Transaction drawer
	let openTransactionSheet = $state(false);
	let selectedCategoryId = $state<string | null>(null);

	const categories = getCategoriesContext();
	const dashboardPath = resolve('/dashboard');

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
		goto(buildDashboardUrl(state), { keepFocus: true, replaceState: true });
	}

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
			navigateDashboard({ mode: 'yearly', view: yearlyView as YearlyView, year: selectedYear });
			return;
		}
		navigateDashboard({ mode: 'monthly', month: selectedMonth, year: selectedYear });
	}

	function onMonthChange(month: string | undefined) {
		if (!month) return;
		navigateDashboard({ mode: 'monthly', month, year: selectedYear });
	}

	function onYearChange(year: string | undefined) {
		if (!year) return;
		if (selectedMode === 'yearly') {
			navigateDashboard({ mode: 'yearly', view: yearlyView as YearlyView, year });
			return;
		}
		navigateDashboard({ mode: 'monthly', month: selectedMonth, year });
	}

	function onYearlyViewChange(view: string | undefined) {
		if (!view) return;
		navigateDashboard({ mode: 'yearly', view: view as YearlyView, year: selectedYear });
	}

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
				totals.set(category, { category, amount: expense.amount });
			}
		}
		return [...totals.values()]
			.filter((d) => d.amount > 0)
			.sort((a, b) => b.amount - a.amount)
			.map((d, i) => ({ ...d, color: chartColors[i % chartColors.length] }));
	});

	// Over-budget categories for alert row (monthly)
	let overBudgetCategories = $derived.by(() => {
		return sortedCategories
			.filter((c) => isCategoryOverBudget(c.id))
			.map((c) => ({
				id: c.id,
				name: c.name,
				actual: getActualAmount(c.id),
				planned: getPlannedAmount(c.id)
			}))
			.sort((a, b) => b.actual - b.planned - (a.actual - a.planned));
	});

	// Top 6 categories sorted by risk level (over budget first, then highest % used)
	let topRiskCategories = $derived.by(() => {
		return [...sortedCategories]
			.filter((c) => getPlannedAmount(c.id) > 0 || getActualAmount(c.id) > 0)
			.sort((a, b) => {
				const aOver = isCategoryOverBudget(a.id);
				const bOver = isCategoryOverBudget(b.id);
				if (aOver && !bOver) return -1;
				if (!aOver && bOver) return 1;
				const aPlanned = getPlannedAmount(a.id);
				const bPlanned = getPlannedAmount(b.id);
				const aPct = aPlanned > 0 ? getActualAmount(a.id) / aPlanned : 0;
				const bPct = bPlanned > 0 ? getActualAmount(b.id) / bPlanned : 0;
				return bPct - aPct;
			})
			.slice(0, 6);
	});

	// Recurring monthly total
	let recurringMonthlyTotal = $derived(
		(data.recurringExpenses || []).reduce((sum, item) => {
			if (item.cadence === 'Monthly') return sum + item.amount;
			if (item.cadence === 'Yearly') return sum + item.amount / 12;
			return sum;
		}, 0)
	);

	// KPI sparkline data
	let netflowSparkline = $derived(data.netflowSparkline || []);
	let spendingSparkline = $derived(data.spendingSparkline || []);

	// Net balance and budget pct for KPI cards
	let netBalance = $derived((data.totalIncome || 0) - (data.actualExpensesTotal || 0));
	let budgetPct = $derived(
		data.plannedExpensesTotal && data.plannedExpensesTotal > 0
			? Math.min(((data.actualExpensesTotal || 0) / data.plannedExpensesTotal) * 100, 999)
			: 0
	);
	let recurringBurdenPct = $derived(
		data.totalIncome && data.totalIncome > 0
			? Math.min((recurringMonthlyTotal / data.totalIncome) * 100, 100)
			: 0
	);

	// Savings velocity: total current contributions across all goals
	let savingsVelocity = $derived(
		(data.goalsWithProgress || []).reduce((sum, g) => sum + g.currentAmount, 0)
	);

	function getCategoryMonthlyData(categoryId: string) {
		if (!data.timeRangeData || !data.actualExpenses) return [];
		const monthlySpending = new SvelteMap<string, number>();
		data.timeRangeData.forEach((item) => monthlySpending.set(item.month, 0));
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
		const currentMonthName = monthNames[new Date().getMonth()];
		const completedData = categoryMonthlyData.filter((d) => d.month !== currentMonthName);
		if (completedData.length === 0) return null;
		const latestMonthData = completedData[completedData.length - 1];
		const monthLabel = latestMonthData.month;
		const currentAmount = latestMonthData.spent;
		if (completedData.length < 2) {
			return {
				direction: latestMonthData.spent > 0 ? 'new' : 'flat',
				value: null,
				monthLabel,
				currentAmount
			};
		}
		const previousMonthData = completedData[completedData.length - 2];
		if (previousMonthData.spent === 0) {
			return {
				direction: latestMonthData.spent > 0 ? 'new' : 'flat',
				value: null,
				monthLabel,
				currentAmount
			};
		}
		const delta = latestMonthData.spent - previousMonthData.spent;
		if (delta === 0) return { direction: 'flat', value: null, monthLabel, currentAmount };
		const percentChange = (delta / Math.abs(previousMonthData.spent)) * 100;
		return {
			direction: percentChange > 0 ? 'up' : 'down',
			value: Math.abs(percentChange),
			monthLabel,
			currentAmount
		};
	}

	// Monthly netflow chart data (yearly view)
	let monthlyNetflowData: MonthlyNetflowData[] = $derived(
		(data.timeRangeData || []).map((d) => ({ month: d.month, net: d.in - d.out }))
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
			return { label: 'Year Progress', title: selectedYear, progress: getYearProgress(year) };
		}
		const month = Number.parseInt(selectedMonth, 10);
		return {
			label: 'Month Progress',
			title: `${monthNames[month - 1]} ${selectedYear}`,
			progress: getMonthProgress(month, year)
		};
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header -->
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
									<Select.Trigger class="w-full">{selectedYear}</Select.Trigger>
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

	<!-- KPI Sparkline Row (always visible) -->
	<div
		class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 {data.windowCleaningJobCount
			? 'lg:grid-cols-5'
			: 'lg:grid-cols-4'}"
	>
		<KpiSparklineCard
			label="Net Balance"
			value={formatCurrency(netBalance)}
			subtext="income minus spending"
			colorScheme={netBalance >= 0 ? 'green' : 'red'}
			sparklineData={netflowSparkline}
			tooltip="Your income minus all spending this month. Positive means you're ahead; negative means you've spent more than you earned. The chart shows the trend over the last 6 months."
		/>
		<KpiSparklineCard
			label="Budget Used"
			value="{budgetPct.toFixed(0)}%"
			subtext="of planned budget"
			colorScheme={budgetPct > 100 ? 'red' : budgetPct > 85 ? 'amber' : 'green'}
			sparklineData={spendingSparkline}
			tooltip="How much of your total planned budget you've used so far. Over 100% means you've exceeded your budget. The chart shows your total spending per month over the last 6 months."
		/>
		<KpiSparklineCard
			label="Recurring Burden"
			value="{recurringBurdenPct.toFixed(0)}%"
			subtext="of income committed"
			colorScheme={recurringBurdenPct > 50 ? 'red' : recurringBurdenPct > 35 ? 'amber' : 'neutral'}
			tooltip="The percentage of your income already committed to recurring expenses (subscriptions, bills, etc.). High values leave less room for discretionary spending."
		/>
		<KpiSparklineCard
			label="Savings Progress"
			value={formatCurrency(savingsVelocity)}
			subtext="total across active goals"
			colorScheme="green"
			tooltip="The total amount saved across all your active savings goals."
		/>
		{#if data.windowCleaningJobCount}
			<WindowCleaningSummaryCard
				revenue={data.windowCleaningRevenue || 0}
				jobCount={data.windowCleaningJobCount}
			/>
		{/if}
	</div>

	{#if selectedMode === 'monthly'}
		<!-- Monthly budget summary + spending breakdown -->
		<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
			<div class="lg:col-span-5">
				<MonthlyBudgetSummaryCard
					actualSpent={data.actualExpensesTotal || 0}
					plannedBudget={data.plannedExpensesTotal || 0}
					totalIncome={data.totalIncome || 0}
					recurringTotal={recurringMonthlyTotal}
					{loading}
				/>
			</div>
			<div class="lg:col-span-7">
				<SpendingBreakdownChart
					chartData={spendingBreakdownData}
					totalSpent={data.actualExpensesTotal || 0}
				/>
			</div>
		</div>

		<!-- Cash flow projection (monthly only) -->
		<div class="mb-6">
			<CashFlowProjectionCard
				totalIncome={data.totalIncome || 0}
				actualSpent={data.actualExpensesTotal || 0}
				{recurringMonthlyTotal}
				plannedExpensesTotal={data.plannedExpensesTotal || 0}
				month={Number(selectedMonth)}
				year={Number(selectedYear)}
			/>
		</div>

		<!-- Budget alert row (only when over budget) -->
		{#if overBudgetCategories.length > 0}
			<div class="mb-6">
				<BudgetAlertRow {overBudgetCategories} onViewCategory={openCategoryDetails} />
			</div>
		{/if}

		<!-- Top 6 at-risk categories (always visible) -->
		{#if topRiskCategories.length > 0}
			<div class="mb-6">
				<div class="mb-3 flex items-center gap-1.5">
					<h2 class="text-lg font-semibold">Category Overview</h2>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button {...props} class="text-muted-foreground/60 hover:text-muted-foreground">
									<InfoIcon class="size-3.5" />
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content class="max-w-64">
							Your top 6 budget categories ranked by risk — over-budget categories appear first,
							followed by those with the highest percentage of their budget used. Click any card to
							see the individual transactions.
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each topRiskCategories as category (category.id)}
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
			</div>
		{/if}

		<!-- Savings goals strip -->
		{@const activeGoals = (data.goalsWithProgress || []).filter((g) => g.status !== 'archived')}
		{#if activeGoals.length > 0}
			<div class="mb-6">
				<GoalsSummaryStrip goals={activeGoals} />
			</div>
		{/if}

		<!-- Trend charts row -->
		<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
			<MonthlyNetflowChart
				chartData={(data.monthlyInOutData || []).map((d) => ({
					month: d.month,
					net: d.in - d.out
				}))}
			/>
			<SpendingTrendLineChart
				chartData={data.monthlyInOutData || []}
				chartTitle="Income vs Spending"
				chartDescription="6-month trend"
			/>
		</div>

		<!-- Recurring expenses card -->
		<div class="mb-6">
			<RecurringExpensesCard
				recurring={data.recurringExpenses || []}
				monthlyTotal={recurringMonthlyTotal}
			/>
		</div>

		<!-- All categories (collapsible, closed by default) -->
		<Collapsible.Root bind:open={categoriesOpen} class="mt-2">
			<Collapsible.Trigger class="group mb-4 flex cursor-pointer items-center gap-2">
				<ChevronDownIcon
					class="h-5 w-5 text-muted-foreground transition-transform duration-200 {categoriesOpen
						? ''
						: '-rotate-90'}"
				/>
				<h2 class="text-xl font-semibold">All Categories</h2>
				<span class="text-sm text-muted-foreground">({sortedCategories.length})</span>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each sortedCategories as category (category.id)}
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

		<!-- Trend charts row (yearly) -->
		<div class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
			<MonthlyNetflowChart chartData={monthlyNetflowData} />
			<SpendingTrendLineChart
				chartData={data.timeRangeData || []}
				chartTitle={yearlyViewLabel + ' Income vs Spending'}
				chartDescription={'Overview of ' + timeRangeDescription.toLowerCase()}
			/>
		</div>

		<div class="mb-6">
			<TimeRangeInOut
				chartTitle={yearlyViewLabel + ' In & Out'}
				chartDescription={'Overview of ' + timeRangeDescription.toLowerCase()}
				chartData={data.timeRangeData}
			/>
		</div>

		<!-- Savings goals strip (yearly) -->
		{@const activeGoalsYearly = (data.goalsWithProgress || []).filter(
			(g) => g.status !== 'archived'
		)}
		{#if activeGoalsYearly.length > 0}
			<div class="mb-6">
				<GoalsSummaryStrip goals={activeGoalsYearly} />
			</div>
		{/if}

		<!-- All category charts (yearly) -->
		<Collapsible.Root bind:open={spentByCategoryOpen} class="mt-2">
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
