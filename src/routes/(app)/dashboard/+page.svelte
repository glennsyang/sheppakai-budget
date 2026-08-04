<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { MonthlyNetflowData, SpendingBreakdownData } from '$lib';
	import BudgetAlertRow from '$lib/components/BudgetAlertRow.svelte';
	import BudgetProgressCard from '$lib/components/BudgetProgressCard.svelte';
	import CardBeam from '$lib/components/CardBeam.svelte';
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import CashFlowProjectionCard from '$lib/components/CashFlowProjectionCard.svelte';
	import CategoryAnomalyAlert from '$lib/components/CategoryAnomalyAlert.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import DashboardCustomizePopover from '$lib/components/DashboardCustomizePopover.svelte';
	import ExcludedSpendList from '$lib/components/ExcludedSpendList.svelte';
	import GoalsSummaryStrip from '$lib/components/GoalsSummaryStrip.svelte';
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import KpiSparklineCard from '$lib/components/KpiSparklineCard.svelte';
	import MonthlyBudgetSummaryCard from '$lib/components/MonthlyBudgetSummaryCard.svelte';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
	import MonthlyNetflowChart from '$lib/components/MonthlyNetflowChart.svelte';
	import MonthlyNetSavingsCard from '$lib/components/MonthlyNetSavingsCard.svelte';
	import RecurringExpensesCard from '$lib/components/RecurringExpensesCard.svelte';
	import SafeToSpendHeroBand from '$lib/components/SafeToSpendHeroBand.svelte';
	import SpendingBreakdownChart from '$lib/components/SpendingBreakdownChart.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import UpcomingBillsCard from '$lib/components/UpcomingBillsCard.svelte';
	import { getCategoriesContext } from '$lib/contexts';
	import { dashboardSectionsForMode } from '$lib/dashboardSections';
	import { formatCurrency, monthNames, months } from '$lib/utils';
	import { computeCashFlowProjection } from '$lib/utils/cashFlowProjection';
	import { getYearProgress } from '$lib/utils/dates';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';
	import { ChevronDownIcon } from '@lucide/svelte';
	import { LandmarkIcon, PiggyBankIcon, PlusIcon, WalletIcon } from '@lucide/svelte/icons';
	import { SvelteMap } from 'svelte/reactivity';

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

	// Quick action: log a new expense without navigating away
	let openLogExpenseModal = $state(false);

	const categories = getCategoriesContext();
	const dashboardPath = resolve('/dashboard');

	// Mode/month/year changes are same-route navigations: keep the controls
	// interactive and skeleton the body, which re-derives entirely from `data`.
	const reloading = usePendingReload();

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

	// Beam color mirrors BudgetProgressCard's progressClass logic
	function getCategoryBeamColor(categoryId: string): string {
		const planned = getPlannedAmount(categoryId);
		const actual = getActualAmount(categoryId);
		if (planned > 0 && actual > planned) return 'rgb(239, 68, 68)'; // red
		const pct = planned > 0 ? (actual / planned) * 100 : 0;
		if (planned > 0 && pct >= 90) return 'rgb(234, 179, 8)'; // amber
		return 'rgb(34, 197, 94)'; // green
	}

	// Spending breakdown donut chart data (monthly)
	let spendingBreakdownData: SpendingBreakdownData[] = $derived.by(() => {
		if (!data.actualExpenses) return [];
		const totals = new Map<
			string,
			{ category: string; categoryId: string | null; amount: number }
		>();
		for (const expense of data.actualExpenses) {
			const categoryId = expense.category?.id ?? null;
			const category = expense.category?.name ?? 'Uncategorized';
			const key = categoryId ?? '__uncategorized__';
			const existing = totals.get(key);
			if (existing) {
				existing.amount += expense.amount;
			} else {
				totals.set(key, { category, categoryId, amount: expense.amount });
			}
		}
		return [...totals.values()]
			.filter((d) => d.amount > 0)
			.sort((a, b) => b.amount - a.amount)
			.map((d, i) => ({ ...d, color: chartColors[i % chartColors.length] }));
	});

	// Month-over-month delta framing for KPI cards (monthly mode only).
	// Year-over-year deltas (yearly mode) are deferred to a later phase — no prior-year data is fetched today.
	type Trend = { direction: 'up' | 'down' | 'flat'; label: string };
	const TREND_EPSILON = 0.5;

	function currencyDeltaTrend(series: { value: number }[]): Trend | undefined {
		if (series.length < 2) return undefined;
		const diff = series[series.length - 1].value - series[series.length - 2].value;
		if (Math.abs(diff) < TREND_EPSILON) return { direction: 'flat', label: 'flat vs last month' };
		const direction = diff > 0 ? 'up' : 'down';
		return {
			direction,
			label: `${diff > 0 ? '+' : '-'}${formatCurrency(Math.abs(diff))} vs last month`
		};
	}

	function spendPercentTrend(series: { value: number }[]): Trend | undefined {
		if (series.length < 2) return undefined;
		const previous = series[series.length - 2].value;
		const current = series[series.length - 1].value;
		if (previous <= 0) return undefined;
		const pctChange = ((current - previous) / previous) * 100;
		if (Math.abs(pctChange) < TREND_EPSILON)
			return { direction: 'flat', label: 'flat vs last month' };
		const direction = pctChange > 0 ? 'up' : 'down';
		const verb = direction === 'up' ? 'more spent' : 'less spent';
		return { direction, label: `${Math.abs(pctChange).toFixed(0)}% ${verb} vs last month` };
	}

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

	// Shared cash-flow projection (monthly only) — feeds the header subtitle, hero band, and waterfall.
	let projection = $derived(
		computeCashFlowProjection({
			totalIncome: data.totalIncome || 0,
			actualSpent: data.actualExpensesTotal || 0,
			recurringMonthlyTotal,
			plannedExpensesTotal: data.plannedExpensesTotal || 0,
			month: Number(selectedMonth),
			year: Number(selectedYear)
		})
	);

	// Personalized header greeting + relative-time subtitle
	let firstName = $derived(data.user?.name?.split(' ')[0] || '');
	let headerGreeting = $derived(firstName ? `Hi, ${firstName}` : 'Dashboard');
	let headerSubtitle = $derived.by(() => {
		if (selectedMode === 'monthly') {
			const days = projection.daysRemainingInclusive;
			return `${days} day${days === 1 ? '' : 's'} left in ${monthNames[Number(selectedMonth) - 1]}`;
		}
		const yearProgress = getYearProgress(Number(selectedYear));
		const monthsLeft = Math.max(yearProgress.totalUnits - yearProgress.elapsedUnits, 0);
		return `${monthsLeft} month${monthsLeft === 1 ? '' : 's'} left in ${selectedYear}`;
	});

	// KPI sparkline data
	let netflowSparkline = $derived(data.netflowSparkline || []);
	let spendingSparkline = $derived(data.spendingSparkline || []);
	let categoryAnomalies = $derived(data.categoryAnomalies || []);

	// Dashboard section show/hide preferences
	let visibleSections = $derived(
		dashboardSectionsForMode(selectedMode === 'yearly' ? 'yearly' : 'monthly')
	);
	let hiddenSectionKeys = $derived(new Set(data.hiddenSections || []));
	function isSectionVisible(key: string): boolean {
		return !hiddenSectionKeys.has(key);
	}
	let netBalanceTrend = $derived(currencyDeltaTrend(netflowSparkline));
	let spendTrend = $derived(spendPercentTrend(spendingSparkline));

	// Net balance and budget pct for KPI cards
	let netBalance = $derived((data.totalIncome || 0) - (data.actualExpensesTotal || 0));
	let budgetPct = $derived(
		data.plannedExpensesTotal && data.plannedExpensesTotal > 0
			? Math.min(((data.actualExpensesTotal || 0) / data.plannedExpensesTotal) * 100, 999)
			: 0
	);
	let nonRecurringActual = $derived(
		Math.max(0, (data.actualExpensesTotal || 0) - recurringMonthlyTotal)
	);
	let nonRecurringBudgetPlanned = $derived(
		Math.max(0, (data.plannedExpensesTotal || 0) - recurringMonthlyTotal)
	);
	let nonRecurringBudgetPct = $derived(
		nonRecurringBudgetPlanned > 0
			? Math.min((nonRecurringActual / nonRecurringBudgetPlanned) * 100, 999)
			: 0
	);
	let recurringBurdenPct = $derived(
		data.totalIncome && data.totalIncome > 0
			? Math.min((recurringMonthlyTotal / data.totalIncome) * 100, 100)
			: 0
	);
	let excludedExpensesTotal = $derived(data.excludedExpensesTotal || 0);

	// Pre-built lookup map for allYearBudgets: key is `${categoryId}-${monthValue}-${year}`
	let allYearBudgetsMap = $derived.by(() => {
		const map = new Map<string, number>();
		for (const b of data.allYearBudgets ?? []) {
			if (b.category?.id && b.month && b.year) {
				map.set(`${b.category.id}-${b.month}-${b.year}`, b.amount);
			}
		}
		return map;
	});

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
		return data.timeRangeData.map((item) => {
			const monthValue = months.find((m) => m.label === item.month)?.value;
			const budgetAmount = monthValue
				? allYearBudgetsMap.get(`${categoryId}-${monthValue}-${String(data.year)}`)
				: undefined;
			const spent = monthlySpending.get(item.month) || 0;
			const budget = budgetAmount;
			return {
				month: item.month,
				spent,
				budget,
				overbudget: budget !== undefined ? Math.max(0, spent - budget) : 0
			};
		});
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

	let categoryChartDescription = $derived.by(() => {
		if (yearlyView !== 'current') return selectedYear;
		const months = data.timeRangeData ?? [];
		if (months.length === 0) return selectedYear;
		return `${months[0].month} - ${months[months.length - 1].month} ${selectedYear}`;
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
				<h1 class="text-3xl font-bold tracking-tight">{headerGreeting}</h1>
				<p class="text-muted-foreground mt-2">{headerSubtitle}</p>
			</div>
			<div class="w-full lg:ml-auto lg:w-136">
				<div class="grid gap-3">
					<div class="flex justify-end gap-3">
						<Button size="sm" class="gap-2" onclick={() => (openLogExpenseModal = true)}>
							<PlusIcon class="size-4" />
							Log Expense
						</Button>
						<DashboardCustomizePopover
							sections={visibleSections}
							dashboardVisibilityForm={data.dashboardVisibilityForm}
						/>
					</div>

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

						<Tabs.Root
							value={selectedMode}
							onValueChange={onModeChange}
							class="flex-1 lg:w-60 lg:flex-none"
						>
							<Tabs.List class="grid w-full grid-cols-2">
								<Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
								<Tabs.Trigger value="yearly">Yearly</Tabs.Trigger>
							</Tabs.List>
						</Tabs.Root>
					</div>

					{#if selectedMode === 'yearly'}
						<div class="flex min-h-10 justify-end">
							<Tabs.Root
								value={yearlyView}
								onValueChange={onYearlyViewChange}
								class="w-full lg:w-104"
							>
								<Tabs.List class="grid w-full grid-cols-2">
									<Tabs.Trigger value="current">Last 6 Months</Tabs.Trigger>
									<Tabs.Trigger value="full">Full Year</Tabs.Trigger>
								</Tabs.List>
							</Tabs.Root>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if reloading.current}
		<CardGridSkeleton
			cards={4}
			linesPerCard={2}
			class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
			label="Loading dashboard figures"
		/>
		<CardGridSkeleton
			cards={2}
			linesPerCard={1}
			lineClass="h-56"
			class="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2"
			label="Loading dashboard charts"
		/>
	{:else if selectedMode === 'monthly'}
		<!-- Safe-to-spend hero band -->
		{#if isSectionVisible('safeToSpendHero')}
			<div class="mb-6">
				<SafeToSpendHeroBand
					dailyDiscretionary={projection.dailyDiscretionary}
					{netBalance}
					daysRemainingInclusive={projection.daysRemainingInclusive}
				/>
			</div>
		{/if}

		<!-- KPI Sparkline Row -->
		{#if isSectionVisible('kpiRow')}
			<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				<KpiSparklineCard
					label="Net Balance"
					value={formatCurrency(netBalance)}
					subtext="income minus spending"
					colorScheme={netBalance >= 0 ? 'green' : 'red'}
					sparklineData={netflowSparkline}
					trendDirection={netBalanceTrend?.direction}
					trendLabel={netBalanceTrend?.label}
					tooltip="Your income minus all spending this month. Positive means you're ahead; negative means you've spent more than you earned. The chart shows the trend over the last 6 months."
				/>
				<KpiSparklineCard
					label="Discretionary Budget Used"
					icon={WalletIcon}
					value={`${nonRecurringBudgetPct.toFixed(0)}%`}
					subtext="of planned budget"
					colorScheme={nonRecurringBudgetPct > 100
						? 'red'
						: nonRecurringBudgetPct > 85
							? 'amber'
							: 'green'}
					sparklineData={spendingSparkline}
					trendDirection={spendTrend?.direction}
					trendLabel={spendTrend?.label}
					tooltip="Your discretionary spending vs. planned budget, excluding recurring expenses. More sensitive than the all-in % — can read higher because the recurring amount isn't cushioning either side."
				/>
				<KpiSparklineCard
					label="Total Budget Used"
					icon={LandmarkIcon}
					value={`${budgetPct.toFixed(0)}%`}
					subtext="of planned budget (incl. recurring)"
					colorScheme={budgetPct > 100 ? 'red' : budgetPct > 85 ? 'amber' : 'green'}
					sparklineData={spendingSparkline}
					trendDirection={spendTrend?.direction}
					trendLabel={spendTrend?.label}
					tooltip="Your total spending vs. total planned budget, including recurring expenses. Can read lower than the excl. recurring % when you're over on discretionary spend, since the recurring amount dilutes both sides equally."
				/>
				<KpiSparklineCard
					label="Recurring Burden"
					value={`${recurringBurdenPct.toFixed(0)}%`}
					subtext="of income committed"
					colorScheme={recurringBurdenPct > 50
						? 'red'
						: recurringBurdenPct > 35
							? 'amber'
							: 'neutral'}
					tooltip="The percentage of your income already committed to recurring expenses (subscriptions, bills, etc.). High values leave less room for discretionary spending."
				/>
				<KpiSparklineCard
					label="Total Savings"
					icon={PiggyBankIcon}
					value={formatCurrency(data.totalSavings || 0)}
					subtext="across all savings accounts"
					colorScheme="green"
					tooltip="The sum of all your savings accounts, same total shown on the Savings page."
				/>
			</div>
		{/if}

		<!-- Monthly budget summary + spending breakdown -->
		{#if isSectionVisible('monthlyOverview')}
			<div class="mb-6 flex flex-col gap-4 lg:grid lg:grid-cols-12">
				<div class="lg:col-span-5">
					<CardBeam color="rgb(239, 68, 68)" active={nonRecurringBudgetPct > 100}>
						<MonthlyBudgetSummaryCard
							actualSpent={data.actualExpensesTotal || 0}
							plannedBudget={data.plannedExpensesTotal || 0}
							totalIncome={data.totalIncome || 0}
							recurringTotal={recurringMonthlyTotal}
							excludedSpendTotal={excludedExpensesTotal}
							excludedSpendBreakdown={data.excludedExpensesBreakdown || []}
						/>
					</CardBeam>
				</div>
				<div class="lg:col-span-7">
					<SpendingBreakdownChart
						chartData={spendingBreakdownData}
						totalSpent={data.actualExpensesTotal || 0}
						onSliceClick={openCategoryDetails}
					/>
				</div>
			</div>
		{/if}

		<!-- Cash flow projection (monthly only) -->
		{#if isSectionVisible('cashFlowProjection')}
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
		{/if}

		<!-- Budget alert row (only when over budget) -->
		{#if overBudgetCategories.length > 0}
			<div class="mb-6">
				<BudgetAlertRow {overBudgetCategories} onViewCategory={openCategoryDetails} />
			</div>
		{/if}

		<!-- Category anomaly insights (unusual spend vs trailing 6-month average) -->
		{#if categoryAnomalies.length > 0}
			<div class="mb-6">
				<CategoryAnomalyAlert anomalies={categoryAnomalies} onViewCategory={openCategoryDetails} />
			</div>
		{/if}

		<!-- Top 6 at-risk categories (always visible) -->
		{#if isSectionVisible('categoryOverview') && topRiskCategories.length > 0}
			<div class="mb-6">
				<div class="mb-3 flex items-center gap-1.5">
					<h2 class="text-lg font-semibold">Category Overview</h2>
					<InfoTooltip
						text="Your top 6 budget categories ranked by risk — over-budget categories appear first, followed by those with the highest percentage of their budget used. Click any card to see the individual transactions."
					/>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each topRiskCategories as category (category.id)}
						{@const categoryOverBudget = isCategoryOverBudget(category.id)}
						<CardBeam color={getCategoryBeamColor(category.id)} active={categoryOverBudget}>
							<button
								type="button"
								onclick={() => openCategoryDetails(category.id)}
								class={`w-full cursor-pointer rounded-xl text-left transition-shadow hover:shadow-md ${categoryOverBudget ? 'ring-destructive/40 ring-1' : ''}`}
							>
								<BudgetProgressCard
									title={category.name}
									planned={getPlannedAmount(category.id)}
									actual={getActualAmount(category.id)}
									label1="Spent"
								/>
							</button>
						</CardBeam>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Savings goals strip -->
		{#if isSectionVisible('goalsStrip') && (data.goalsWithProgress || []).length > 0}
			<div class="mb-6">
				<GoalsSummaryStrip goals={data.goalsWithProgress || []} />
			</div>
		{/if}

		<!-- Upcoming bills -->
		{#if isSectionVisible('upcomingBills')}
			<div class="mb-6">
				<UpcomingBillsCard recurring={data.recurringExpenses || []} />
			</div>
		{/if}

		<!-- Recurring expenses card -->
		{#if isSectionVisible('recurringExpenses')}
			<div class="mb-6">
				<RecurringExpensesCard
					recurring={data.recurringExpenses || []}
					monthlyTotal={recurringMonthlyTotal}
				/>
			</div>
		{/if}

		<!-- All categories (collapsible, closed by default) -->
		{#if isSectionVisible('allCategories')}
			<Collapsible.Root bind:open={categoriesOpen} class="mt-2">
				<Collapsible.Trigger class="group mb-4 flex cursor-pointer items-center gap-2">
					<ChevronDownIcon
						class="text-muted-foreground h-5 w-5 transition-transform duration-200 {categoriesOpen
							? ''
							: '-rotate-90'}"
					/>
					<h2 class="text-xl font-semibold">All Categories</h2>
					<span class="text-muted-foreground text-sm">({sortedCategories.length})</span>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each sortedCategories as category (category.id)}
							{@const categoryOverBudget = isCategoryOverBudget(category.id)}
							<CardBeam color={getCategoryBeamColor(category.id)} active={categoryOverBudget}>
								<button
									type="button"
									onclick={() => openCategoryDetails(category.id)}
									class={`w-full cursor-pointer rounded-xl text-left transition-shadow hover:shadow-md ${categoryOverBudget ? 'ring-destructive/40 ring-1' : ''}`}
								>
									<BudgetProgressCard
										title={category.name}
										planned={getPlannedAmount(category.id)}
										actual={getActualAmount(category.id)}
										label1="Spent"
									/>
								</button>
							</CardBeam>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}
	{:else}
		<!-- Yearly YTD KPI row -->
		{#if isSectionVisible('ytdStats')}
			<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				<div class="bg-card rounded-xl border p-4 shadow-xs">
					<p class="text-muted-foreground text-sm">YTD Income</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">
						{formatCurrency(data.totalIncome || 0)}
					</p>
				</div>
				<div class="bg-card rounded-xl border p-4 shadow-xs">
					<p class="text-muted-foreground text-sm">YTD Spent</p>
					<p class="mt-1 text-2xl font-bold tabular-nums">
						{formatCurrency(data.actualExpensesTotal || 0)}
					</p>
				</div>
				<div class="bg-card rounded-xl border p-4 shadow-xs">
					<p class="text-muted-foreground text-sm">YTD Net</p>
					<p
						class={`mt-1 text-2xl font-bold tabular-nums ${ytdNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
					>
						{ytdNet >= 0 ? '+' : ''}{formatCurrency(ytdNet)}
					</p>
				</div>
				<div class="bg-card rounded-xl border p-4 shadow-xs">
					<p class="text-muted-foreground text-sm">Total Savings</p>
					<p class="mt-1 text-2xl font-bold text-green-600 tabular-nums dark:text-green-400">
						{formatCurrency(data.totalSavings || 0)}
					</p>
					<p class="text-muted-foreground mt-1 text-xs">Across all savings accounts</p>
				</div>
				{#if excludedExpensesTotal > 0}
					<div class="bg-card rounded-xl border p-4 text-sm shadow-xs">
						<p class="text-muted-foreground mb-1 text-sm">YTD Excluded Spend</p>
						<ExcludedSpendList
							total={excludedExpensesTotal}
							breakdown={data.excludedExpensesBreakdown || []}
						/>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Net Savings table (yearly) -->
		{#if isSectionVisible('netSavingsTable')}
			<div class="mb-6">
				<MonthlyNetSavingsCard chartData={data.timeRangeData || []} />
			</div>
		{/if}

		<!-- Monthly netflow trend (yearly) -->
		{#if isSectionVisible('trendCharts')}
			<div class="mb-6">
				<MonthlyNetflowChart chartData={monthlyNetflowData} />
			</div>
		{/if}

		<!-- Savings goals strip (yearly) -->
		{#if isSectionVisible('goalsStrip') && (data.goalsWithProgress || []).length > 0}
			<div class="mb-6">
				<GoalsSummaryStrip goals={data.goalsWithProgress || []} />
			</div>
		{/if}

		<!-- All category charts (yearly) -->
		{#if isSectionVisible('spentByCategory')}
			<Collapsible.Root bind:open={spentByCategoryOpen} class="mt-2">
				<Collapsible.Trigger class="group mb-4 flex cursor-pointer items-center gap-2">
					<ChevronDownIcon
						class="text-muted-foreground h-5 w-5 transition-transform duration-200 {spentByCategoryOpen
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
								chartDescription={categoryChartDescription}
							/>
						{/each}
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}
	{/if}
</div>

{#if selectedMode === 'monthly'}
	<CategoryTransactionSheet
		bind:openSheet={openTransactionSheet}
		transactions={filteredTransactions}
		category={selectedCategory}
		month={selectedMonth}
		year={parseInt(selectedYear)}
	/>
{/if}

<TransactionModal
	bind:open={openLogExpenseModal}
	categories={categories()}
	transactionForm={data.transactionForm}
/>
