<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { MonthlyNetflowData, SpendingBreakdownData } from '$lib';
	import BudgetAlertRow from '$lib/components/BudgetAlertRow.svelte';
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import CategoryAnomalyAlert from '$lib/components/CategoryAnomalyAlert.svelte';
	import CategoryBudgetList from '$lib/components/CategoryBudgetList.svelte';
	import CategoryTransactionSheet from '$lib/components/CategoryTransactionSheet.svelte';
	import DashboardCustomizePopover from '$lib/components/DashboardCustomizePopover.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import GoalsSummaryStrip from '$lib/components/GoalsSummaryStrip.svelte';
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import MonthDetailCard from '$lib/components/MonthDetailCard.svelte';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
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
	import YearOverviewHero from '$lib/components/YearOverviewHero.svelte';
	import { getCategoriesContext } from '$lib/contexts';
	import { dashboardSectionsForMode } from '$lib/dashboardSections';
	import { formatCurrency, monthNames, months } from '$lib/utils';
	import { computeCashFlowProjection } from '$lib/utils/cashFlowProjection';
	import {
		getCurrentPacificMonthYear,
		getMonthProgress,
		getYearProgress,
		padMonth,
		parseMonthParam,
		parseYearParam
	} from '$lib/utils/dates';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';
	import { ChevronDownIcon } from '@lucide/svelte';
	import { PlusIcon } from '@lucide/svelte/icons';
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

	const { month: currentMonth, year: currentYear } = getCurrentPacificMonthYear();

	let selectedMode = $derived(page.url.searchParams.get('mode') ?? data.mode ?? 'monthly');
	let selectedMonth: string = $derived(
		padMonth(
			parseMonthParam(
				page.url.searchParams.get('month'),
				parseMonthParam(data.month?.toString() ?? null, currentMonth)
			)
		)
	);
	let selectedYear: string = $derived(
		String(
			parseYearParam(
				page.url.searchParams.get('year'),
				parseYearParam(data.year?.toString() ?? null, currentYear)
			)
		)
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
		'var(--chart-5)',
		'var(--chart-6)',
		'var(--chart-7)',
		'var(--chart-8)'
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
			.map((d) => ({
				...d,
				color: (d.categoryId && categoryColors.get(d.categoryId)) || 'var(--chart-8)'
			}));
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

	// Shared "is the selected month the real current month" status — gates widgets
	// that only make sense for the month actually in progress (safe-to-spend,
	// cash flow projection daily figures, upcoming bills, recurring paid status).
	let monthStatus = $derived(getMonthProgress(Number(selectedMonth), Number(selectedYear)).status);

	// Personalized header greeting + relative-time subtitle
	let firstName = $derived(data.user?.name?.split(' ')[0] || '');
	let headerGreeting = $derived(firstName ? `Hi, ${firstName}` : 'Dashboard');
	let headerSubtitle = $derived.by(() => {
		if (selectedMode === 'monthly') {
			const monthName = monthNames[Number(selectedMonth) - 1];
			if (monthStatus === 'past') return `${monthName} is complete`;
			if (monthStatus === 'future') return `${monthName} hasn't started yet`;
			const days = projection.daysRemainingInclusive;
			return `${days} day${days === 1 ? '' : 's'} left in ${monthName}`;
		}
		const yearProgress = getYearProgress(Number(selectedYear));
		if (yearProgress.status === 'past') return `${selectedYear} is complete`;
		if (yearProgress.status === 'future') return `${selectedYear} hasn't started yet`;
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
	let goalsWithProgress = $derived(data.goalsWithProgress || []);
	let totalGoalsSaved = $derived(goalsWithProgress.reduce((acc, g) => acc + g.currentAmount, 0));
	let totalGoalsTarget = $derived(goalsWithProgress.reduce((acc, g) => acc + g.targetAmount, 0));
	let excludedExpensesTotal = $derived(data.excludedExpensesTotal || 0);

	// Category identity colour, stable by alphabetical position. Seven hues 30° apart, clear of
	// the red, amber and green bands reserved for money state, in two lightness tiers (14 colours).
	// Handed out in a stride so neighbouring categories land far apart on both axes.
	const CATEGORY_HUES = [190, 280, 340, 220, 310, 115, 250];
	let categoryColors = $derived(
		new Map(
			sortedCategories.map((c, i) => {
				const hue = CATEGORY_HUES[i % CATEGORY_HUES.length];
				const tier = Math.floor(i / CATEGORY_HUES.length) % 2;
				return [
					c.id,
					`oklch(calc(var(--category-l) - ${tier} * var(--category-tier-step)) var(--category-c) ${hue})`
				];
			})
		)
	);
	function categoryRows(list: { id: string; name: string }[]) {
		return list.map((c) => ({
			id: c.id,
			name: c.name,
			planned: getPlannedAmount(c.id),
			actual: getActualAmount(c.id),
			color: categoryColors.get(c.id) ?? chartColors[0]
		}));
	}

	function budgetTone(pct: number): Stat['tone'] {
		return pct > 100 ? 'negative' : pct > 85 ? 'warning' : 'positive';
	}

	let monthlyStats: Stat[] = $derived.by(() => {
		const hasIncome = (data.totalIncome || 0) > 0;
		const stats: Stat[] = [
			{
				label: 'Discretionary used',
				value: `${nonRecurringBudgetPct.toFixed(0)}%`,
				subtext: 'of planned budget',
				tone: budgetTone(nonRecurringBudgetPct),
				meter: nonRecurringBudgetPct,
				// A week in, month-over-month spend comparisons are mostly noise.
				trend: monthStatus === 'current' && projection.daysElapsed < 7 ? undefined : spendTrend,
				tooltip:
					"Your discretionary spending vs. planned budget, excluding recurring expenses. More sensitive than the all-in % because the recurring amount isn't cushioning either side."
			},
			{
				label: 'Total budget used',
				value: `${budgetPct.toFixed(0)}%`,
				subtext: 'incl. recurring',
				tone: budgetTone(budgetPct),
				meter: budgetPct,
				tooltip:
					'Your total spending vs. total planned budget, including recurring expenses. Can read lower than the discretionary % because the recurring amount dilutes both sides equally.'
			},
			{
				label: 'Recurring burden',
				value: hasIncome ? `${recurringBurdenPct.toFixed(0)}%` : '—',
				subtext: hasIncome ? 'of income committed' : 'no income logged yet',
				tone:
					recurringBurdenPct > 50 ? 'negative' : recurringBurdenPct > 35 ? 'warning' : 'neutral',
				meter: hasIncome ? recurringBurdenPct : undefined,
				tooltip:
					'The percentage of your income committed to recurring expenses (subscriptions, bills, etc.). High values leave less room for discretionary spending.'
			},
			{
				label: 'Total savings',
				value: formatCurrency(data.totalSavings || 0),
				subtext: 'across all accounts',
				tooltip: 'The sum of all your savings accounts, same total shown on the Savings page.'
			}
		];
		if (goalsWithProgress.length > 0) {
			stats.push({
				label: 'Savings goals',
				value: formatCurrency(totalGoalsSaved),
				subtext: `of ${formatCurrency(totalGoalsTarget)} · ${goalsWithProgress.length} goal${goalsWithProgress.length === 1 ? '' : 's'}`,
				meter: totalGoalsTarget > 0 ? (totalGoalsSaved / totalGoalsTarget) * 100 : 0,
				tooltip:
					'The combined amount saved across all your active savings goals, compared to their combined target amount.'
			});
		}
		return stats;
	});

	// Discretionary transactions feed the pace chart; recurring is a separate monthly lump.
	let discretionaryExpenses = $derived(
		(data.actualExpenses || []).map((e) => ({ date: String(e.date), amount: e.amount }))
	);

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
	let yearlyStats: Stat[] = $derived.by(() => {
		const stats: Stat[] = [
			{ label: 'Income', value: formatCurrency(data.totalIncome || 0), subtext: 'year to date' },
			{
				label: 'Spent',
				value: formatCurrency(data.actualExpensesTotal || 0),
				subtext: 'year to date, incl. recurring'
			},
			{
				label: 'Total savings',
				value: formatCurrency(data.totalSavings || 0),
				subtext: 'across all accounts',
				tooltip: 'The sum of all your savings accounts, same total shown on the Savings page.'
			}
		];
		if (goalsWithProgress.length > 0) {
			stats.push({
				label: 'Savings goals',
				value: formatCurrency(totalGoalsSaved),
				subtext: `of ${formatCurrency(totalGoalsTarget)} · ${goalsWithProgress.length} goal${goalsWithProgress.length === 1 ? '' : 's'}`,
				meter: totalGoalsTarget > 0 ? (totalGoalsSaved / totalGoalsTarget) * 100 : 0
			});
		}
		if (excludedExpensesTotal > 0) {
			const names = (data.excludedExpensesBreakdown || []).map((c) => c.categoryName);
			stats.push({
				label: 'Not counted',
				value: formatCurrency(excludedExpensesTotal),
				subtext:
					names.length > 2
						? `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
						: names.join(', '),
				tooltip: `Spending in categories excluded from the budget: ${names.join(', ')}. It isn't counted in income, spent or net.`
			});
		}
		return stats;
	});

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

<div class="mx-auto w-full max-w-7xl py-4 sm:py-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{headerGreeting}</h1>
			<p class="text-muted-foreground mt-1 text-sm">{headerSubtitle}</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<Tabs.Root value={selectedMode} onValueChange={onModeChange}>
				<Tabs.List class="h-9">
					<Tabs.Trigger value="monthly" class="px-3">Monthly</Tabs.Trigger>
					<Tabs.Trigger value="yearly" class="px-3">Yearly</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			{#if selectedMode === 'monthly'}
				<Select.Root type="single" value={selectedMonth} onValueChange={onMonthChange}>
					<Select.Trigger class="w-36" aria-label="Month">
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
			{:else}
				<Select.Root type="single" value={selectedYear} onValueChange={onYearChange}>
					<Select.Trigger class="w-28" aria-label="Year">{selectedYear}</Select.Trigger>
					<Select.Content>
						<Select.Label>Select Year</Select.Label>
						{#each yearOptions as yearOption (yearOption.value)}
							<Select.Item value={yearOption.value} label={yearOption.label}>
								{yearOption.label}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<Tabs.Root value={yearlyView} onValueChange={onYearlyViewChange}>
					<Tabs.List class="h-9">
						<Tabs.Trigger value="current" class="px-3">Last 6 months</Tabs.Trigger>
						<Tabs.Trigger value="full" class="px-3">Full year</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			{/if}
			<DashboardCustomizePopover
				sections={visibleSections}
				dashboardVisibilityForm={data.dashboardVisibilityForm}
			/>
			<Button class="ms-auto gap-1.5 lg:ms-0" onclick={() => (openLogExpenseModal = true)}>
				<PlusIcon class="size-4" />
				Log expense
			</Button>
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
	{:else if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else if selectedMode === 'monthly'}
		{#if isSectionVisible('safeToSpendHero')}
			<div class="mb-4">
				<SafeToSpendHeroBand
					dailyDiscretionary={projection.dailyDiscretionary}
					discretionaryRemaining={projection.discretionaryRemaining}
					{netBalance}
					daysRemainingInclusive={projection.daysRemainingInclusive}
					daysInMonth={projection.daysInMonth}
					{discretionaryExpenses}
					discretionaryBudget={nonRecurringBudgetPlanned}
					month={Number(selectedMonth)}
					year={Number(selectedYear)}
				/>
			</div>
		{/if}

		{#if isSectionVisible('kpiRow')}
			<div class="mb-8">
				<DashboardStatStrip stats={monthlyStats} />
			</div>
		{/if}

		{#if overBudgetCategories.length > 0}
			<div class="mb-4">
				<BudgetAlertRow {overBudgetCategories} onViewCategory={openCategoryDetails} />
			</div>
		{/if}

		{#if categoryAnomalies.length > 0}
			<div class="mb-4">
				<CategoryAnomalyAlert anomalies={categoryAnomalies} onViewCategory={openCategoryDetails} />
			</div>
		{/if}

		{#if isSectionVisible('categoryOverview') && topRiskCategories.length > 0}
			<section class="mb-8">
				<div class="mb-3 flex items-center gap-1.5">
					<h2 class="text-base font-semibold tracking-tight">Categories to watch</h2>
					<InfoTooltip
						text="Your top 6 budget categories ranked by risk: over-budget first, then the highest share of budget used. Select one to see its transactions."
					/>
				</div>
				<CategoryBudgetList
					categories={categoryRows(topRiskCategories)}
					onSelect={openCategoryDetails}
				/>
			</section>
		{/if}

		{#if isSectionVisible('monthlyOverview') || isSectionVisible('cashFlowProjection')}
			<div class="mb-8 grid items-start gap-4 lg:grid-cols-2">
				<MonthDetailCard
					actualSpent={data.actualExpensesTotal || 0}
					plannedBudget={data.plannedExpensesTotal || 0}
					totalIncome={data.totalIncome || 0}
					recurringTotal={recurringMonthlyTotal}
					excludedSpendTotal={excludedExpensesTotal}
					excludedSpendBreakdown={data.excludedExpensesBreakdown || []}
					netTrendLabel={netBalanceTrend?.label}
					showProjection={isSectionVisible('cashFlowProjection')}
					month={Number(selectedMonth)}
					year={Number(selectedYear)}
				/>
				{#if isSectionVisible('monthlyOverview')}
					<SpendingBreakdownChart
						chartData={spendingBreakdownData}
						onSliceClick={openCategoryDetails}
					/>
				{/if}
			</div>
		{/if}

		{#if isSectionVisible('goalsStrip') && goalsWithProgress.length > 0}
			<div class="mb-8">
				<GoalsSummaryStrip goals={goalsWithProgress} />
			</div>
		{/if}

		{#if isSectionVisible('upcomingBills') && monthStatus === 'current'}
			<div class="mb-8">
				<UpcomingBillsCard recurring={data.recurringExpenses || []} />
			</div>
		{/if}

		{#if isSectionVisible('recurringExpenses')}
			<div class="mb-8">
				<RecurringExpensesCard
					recurring={data.recurringExpenses || []}
					monthlyTotal={recurringMonthlyTotal}
					isCurrentMonth={monthStatus === 'current'}
				/>
			</div>
		{/if}

		{#if isSectionVisible('allCategories')}
			<Collapsible.Root bind:open={categoriesOpen}>
				<Collapsible.Trigger
					class="group hover:text-foreground mb-3 flex cursor-pointer items-center gap-2 rounded-md"
				>
					<ChevronDownIcon
						class="text-muted-foreground size-4 transition-transform duration-200 {categoriesOpen
							? ''
							: '-rotate-90'}"
					/>
					<h2 class="text-base font-semibold tracking-tight">All categories</h2>
					<span class="text-muted-foreground text-sm tabular-nums">{sortedCategories.length}</span>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<CategoryBudgetList
						categories={categoryRows(sortedCategories)}
						onSelect={openCategoryDetails}
					/>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}
	{:else}
		{#if isSectionVisible('ytdStats') || isSectionVisible('trendCharts')}
			<div class="mb-4">
				<YearOverviewHero
					year={Number(selectedYear)}
					totalIncome={data.totalIncome || 0}
					totalSpent={data.actualExpensesTotal || 0}
					netflowData={monthlyNetflowData}
					rangeLabel={categoryChartDescription}
					showChart={isSectionVisible('trendCharts')}
				/>
			</div>
		{/if}

		{#if isSectionVisible('ytdStats')}
			<div class="mb-8">
				<DashboardStatStrip stats={yearlyStats} />
			</div>
		{/if}

		{#if isSectionVisible('netSavingsTable')}
			<div class="mb-8">
				<MonthlyNetSavingsCard
					chartData={data.timeRangeData || []}
					rangeLabel={categoryChartDescription}
				/>
			</div>
		{/if}

		<!-- Savings goals strip (yearly) -->
		{#if isSectionVisible('goalsStrip') && goalsWithProgress.length > 0}
			<div class="mb-6">
				<GoalsSummaryStrip goals={goalsWithProgress} />
			</div>
		{/if}

		<!-- All category charts (yearly) -->
		{#if isSectionVisible('spentByCategory')}
			<Collapsible.Root bind:open={spentByCategoryOpen}>
				<Collapsible.Trigger
					class="group hover:text-foreground mb-3 flex cursor-pointer items-center gap-2 rounded-md"
				>
					<ChevronDownIcon
						class="text-muted-foreground size-4 transition-transform duration-200 {spentByCategoryOpen
							? ''
							: '-rotate-90'}"
					/>
					<h2 class="text-base font-semibold tracking-tight">Spent by category</h2>
					<span class="text-muted-foreground text-sm tabular-nums">{sortedCategories.length}</span>
				</Collapsible.Trigger>
				<Collapsible.Content>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each sortedCategories as category (category.id)}
							{@const categoryMonthlyData = getCategoryMonthlyData(category.id)}
							<MonthlyCategoryChart
								chartTitle={category?.name}
								chartData={categoryMonthlyData}
								chartDescription={categoryChartDescription}
								color={categoryColors.get(category.id)}
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
