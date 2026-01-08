<script lang="ts">
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { getContext } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import LineChart from '$lib/components/LineChart.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import PresetBudgetCard from '$lib/components/PresetBudgetCard.svelte';
	import SummaryRow from '$lib/components/SummaryRow.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { months } from '$lib/utils';

	import type { PageProps } from './$types';

	import type { Budget, Category, ChartData } from '$lib';

	let { data }: PageProps = $props();

	let openCategoryDialog = $state<boolean>(false);
	let selectedCategoryId = $state<string | null>(null);
	let editAmount = $state<string>('');
	let editingCustomAmount = $state<boolean>(false);
	// Track selected preset amount per category
	let categoryPresetSelections = $state<
		Record<string, 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom' | null>
	>({});

	// Calculate total recurring expenses
	let totalRecurring = $derived((data.recurring || []).reduce((sum, item) => sum + item.amount, 0));

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`?month=${month}&year=${year}`, { keepFocus: true, replaceState: true });
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`?month=${month}&year=${selectedYear}`, { keepFocus: true, replaceState: true });
		}
	}

	const categories = getContext('categories') as () => Category[];

	// Sort categories alphabetically
	let sortedCategories = $derived([...categories()].sort((a, b) => a.name.localeCompare(b.name)));

	// Get budget for a specific category
	function getBudgetForCategory(categoryId: string): Budget | undefined {
		return (data.budget as Budget[]).find((b) => b.category?.id === categoryId);
	}

	// Calculate total budget for the month
	let totalBudget = $derived((data.budget as Budget[]).reduce((sum, b) => sum + b.amount, 0));

	// Calculate categories without budgets
	let categoriesWithoutBudget = $derived(
		sortedCategories.filter((category) => !getBudgetForCategory(category.id))
	);
	let allBudgetsSet = $derived(categoriesWithoutBudget.length === 0);

	// Get selected category details
	let selectedCategory = $derived(
		selectedCategoryId ? categories().find((c) => c.id === selectedCategoryId) : null
	);

	let selectedBudget = $derived(
		selectedCategoryId ? getBudgetForCategory(selectedCategoryId) : null
	);

	// Get the selected preset for the current category
	let selectedPresetAmount = $derived(
		selectedCategoryId ? categoryPresetSelections[selectedCategoryId] || null : null
	);

	// Create chartData for the selected category
	let chartData = $derived.by(() => {
		if (!selectedCategoryId || !data.last6Months) {
			return [];
		}

		return data.last6Months.map((monthData) => {
			// Find budget for this month/category
			const budgetForMonth = data.historicalBudgets?.find(
				(b) =>
					b.category?.id === selectedCategoryId &&
					b.month === monthData.month &&
					b.year === monthData.year
			);

			// Find transaction total for this month/category
			const transactionForMonth = data.historicalTransactions?.find(
				(t) =>
					t.categoryId === selectedCategoryId &&
					t.month === monthData.month &&
					t.year === monthData.year
			);

			return {
				date: monthData.date,
				planned: budgetForMonth?.amount || 0,
				actual: transactionForMonth?.total || 0
			} as ChartData;
		});
	});

	// Calculate trending percentage for the chart
	let trendingPercentage = $derived.by(() => {
		if (chartData.length < 2) return null;

		const lastMonth = chartData[chartData.length - 1].actual;
		const previousMonth = chartData[chartData.length - 2].actual;

		if (previousMonth === 0) return null;

		const percentChange = ((lastMonth - previousMonth) / previousMonth) * 100;
		return {
			value: Math.abs(percentChange),
			direction: percentChange >= 0 ? ('up' as const) : ('down' as const)
		};
	});

	// Calculate month range label for the chart
	let monthRangeLabel = $derived.by(() => {
		if (chartData.length === 0) return '';

		const firstDate = chartData[0].date;
		const lastDate = chartData[chartData.length - 1].date;

		const firstMonth = firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		const lastMonth = lastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

		return `${firstMonth} - ${lastMonth}`;
	});

	// Set first category as selected by default
	$effect(() => {
		if (!selectedCategoryId && sortedCategories.length > 0) {
			selectedCategoryId = sortedCategories[0].id;
		}
	});

	// Auto-select preset based on budget data
	$effect(() => {
		if (selectedCategoryId && selectedBudget) {
			// If we haven't set a selection for this category yet, determine it from database
			if (!categoryPresetSelections[selectedCategoryId]) {
				if (selectedBudget.presetType) {
					// Use presetType from database
					categoryPresetSelections[selectedCategoryId] = selectedBudget.presetType as
						| 'lastMonth'
						| 'lastMonthBudget'
						| 'average'
						| 'custom';
				} else {
					// Legacy budget without presetType - try to infer from amount
					const budgetAmount = selectedBudget.amount;
					const lastMonthSpent = getLastMonthSpent(selectedCategoryId);
					const lastMonthBudget = getLastMonthBudget(selectedCategoryId);
					const averageSpent = getAverageSpent(selectedCategoryId);

					// Check if budget matches any preset
					if (budgetAmount === lastMonthSpent && lastMonthSpent > 0) {
						categoryPresetSelections[selectedCategoryId] = 'lastMonth';
					} else if (budgetAmount === lastMonthBudget && lastMonthBudget > 0) {
						categoryPresetSelections[selectedCategoryId] = 'lastMonthBudget';
					} else if (budgetAmount === averageSpent && averageSpent > 0) {
						categoryPresetSelections[selectedCategoryId] = 'average';
					} else if (budgetAmount > 0) {
						// Custom amount entered
						categoryPresetSelections[selectedCategoryId] = 'custom';
					}
				}
			}
		} else if (selectedCategoryId && !selectedBudget) {
			// No budget exists - do not auto-select anything
			if (categoryPresetSelections[selectedCategoryId]) {
				// Clear any existing selection when switching to a category without budget
				categoryPresetSelections[selectedCategoryId] = null;
			}
		}
	});

	function cancelEditing() {
		editAmount = '';
		editingCustomAmount = false;
	}

	function startEditingCustomAmount() {
		editingCustomAmount = true;
		if (selectedCategoryId) {
			categoryPresetSelections[selectedCategoryId] = 'custom';
		}
		if (selectedBudget) {
			editAmount = selectedBudget.amount.toString();
		} else {
			editAmount = '';
		}
	}

	// Calculate preset amounts for the selected category
	function getLastMonthSpent(categoryId: string): number {
		// Calculate previous month and year
		let prevMonth = selectedMonth - 1;
		let prevYear = selectedYear;

		if (prevMonth === 0) {
			prevMonth = 12;
			prevYear -= 1;
		}

		const prevMonthStr = prevMonth.toString().padStart(2, '0');
		const prevYearStr = prevYear.toString();

		// Find transaction total for previous month and category
		const transaction = data.historicalTransactions?.find(
			(t) => t.categoryId === categoryId && t.month === prevMonthStr && t.year === prevYearStr
		);

		return transaction?.total || 0;
	}

	function getLastMonthBudget(categoryId: string): number {
		// Calculate previous month and year
		let prevMonth = selectedMonth - 1;
		let prevYear = selectedYear;

		if (prevMonth === 0) {
			prevMonth = 12;
			prevYear -= 1;
		}

		const prevMonthStr = prevMonth.toString().padStart(2, '0');
		const prevYearStr = prevYear.toString();

		// Find budget for previous month and category
		const budgetRecord = data.historicalBudgets?.find(
			(b) => b.category?.id === categoryId && b.month === prevMonthStr && b.year === prevYearStr
		);

		return budgetRecord?.amount || 0;
	}

	function getAverageSpent(categoryId: string): number {
		// Filter transactions for this category
		const categoryTransactions =
			data.historicalTransactions?.filter((t) => t.categoryId === categoryId) || [];

		if (categoryTransactions.length === 0) {
			return 0;
		}

		// Calculate average by summing totals and dividing by count
		const sum = categoryTransactions.reduce((acc, t) => acc + t.total, 0);
		const average = sum / categoryTransactions.length;

		return Math.round(average * 100) / 100; // Round to 2 decimal places
	}

	// Derived preset amounts for selected category
	let presetAmounts = $derived({
		lastMonthSpent: selectedCategoryId ? getLastMonthSpent(selectedCategoryId) : 0,
		lastMonthBudget: selectedCategoryId ? getLastMonthBudget(selectedCategoryId) : 0,
		averageSpent: selectedCategoryId ? getAverageSpent(selectedCategoryId) : 0
	});

	function selectPresetAmount(
		type: 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom',
		amount: number
	) {
		if (selectedCategoryId) {
			categoryPresetSelections[selectedCategoryId] = type;
		}
		if (type !== 'custom') {
			editAmount = amount.toString();
		}
	}
</script>

<svelte:head>
	<title>Budgets</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header with Month Switcher -->
	<div class="mb-8">
		<div class="flex items-center justify-between gap-4">
			<div class="hidden md:flex">
				<MonthYearSwitcher
					currentMonth={selectedMonth}
					currentYear={selectedYear}
					onMonthChange={onMonthYearChange}
				/>
			</div>
			<div class="w-full md:w-44">
				<Select.Root type="single" value={selectedMonth.toString()} onValueChange={onMonthJump}>
					<Select.Trigger class="w-full">
						{months.find((m) => m.value === selectedMonth.toString())?.label || 'Jump to Month'}
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

	<!-- Three Column Layout -->
	<div class="grid grid-cols-13 gap-4">
		<!-- Column 1: Category List -->
		<div class="col-span-3">
			<div class="rounded-lg border bg-card shadow">
				<div class="border-b p-6">
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">Categories</h3>
						<button
							type="button"
							class="rounded p-1 hover:bg-muted"
							onclick={() => (openCategoryDialog = true)}
						>
							<SettingsIcon class="h-4 w-4" />
						</button>
					</div>
				</div>
				<div class="p-0">
					<div class="max-h-150 overflow-y-auto">
						{#each sortedCategories as category (category.id)}
							{@const categoryBudget = getBudgetForCategory(category.id)}
							<button
								class="w-full px-4 py-3 text-left transition-colors hover:bg-muted {selectedCategoryId ===
								category.id
									? 'border-l-4 border-primary bg-muted'
									: 'border-l-4 border-transparent'}"
								onclick={() => (selectedCategoryId = category.id)}
							>
								<div class="flex items-center justify-between">
									<span class="font-medium">{category.name}</span>
									{#if categoryBudget}
										<CheckCircleIcon class="h-4 w-4 text-green-500" />
									{:else}
										<HelpCircleIcon class="h-4 w-4 text-muted-foreground" />
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Column 2: Category Detail -->
		<div class="col-span-7">
			{#if selectedCategory}
				<!-- Heading -->
				<div class="mb-6">
					<h2 class="text-2xl font-semibold">
						{selectedCategory.name} budget is set to:
					</h2>
				</div>

				<!-- Four Mini Cards -->
				<div class="mb-6 grid grid-cols-4 gap-4">
					<!-- Last Month Spent -->
					<PresetBudgetCard
						title="How much I spent last month"
						amount={presetAmounts.lastMonthSpent}
						isSelected={selectedPresetAmount === 'lastMonth'}
						presetType="lastMonth"
						budgetId={selectedBudget?.id}
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('lastMonth', presetAmounts.lastMonthSpent)}
					/>

					<!-- Last Month Budget -->
					<PresetBudgetCard
						title="How much I budgeted last month"
						amount={presetAmounts.lastMonthBudget}
						isSelected={selectedPresetAmount === 'lastMonthBudget'}
						presetType="lastMonthBudget"
						budgetId={selectedBudget?.id}
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('lastMonthBudget', presetAmounts.lastMonthBudget)}
					/>

					<!-- Average Spent -->
					<PresetBudgetCard
						title="How much I spend on average"
						amount={presetAmounts.averageSpent}
						isSelected={selectedPresetAmount === 'average'}
						presetType="average"
						budgetId={selectedBudget?.id}
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('average', presetAmounts.averageSpent)}
					/>

					<!-- Custom Amount -->
					<PresetBudgetCard
						title="Custom"
						amount={selectedBudget && selectedBudget.presetType === 'custom'
							? selectedBudget.amount
							: 0}
						isSelected={selectedPresetAmount === 'custom'}
						isCustom={true}
						isEditing={editingCustomAmount}
						{editAmount}
						budgetId={selectedBudget?.id}
						presetType="custom"
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('custom', 0)}
						onEdit={startEditingCustomAmount}
						onCancel={cancelEditing}
					/>
				</div>

				<!-- Bar Chart -->
				<div class="mt-6">
					<LineChart
						categoryName={selectedCategory.name}
						{chartData}
						trendingData={trendingPercentage}
						monthRange={monthRangeLabel}
					/>
				</div>
			{:else}
				<div class="rounded-lg border bg-card shadow">
					<div class="p-12 text-center text-muted-foreground">
						<p>Select a category to view or edit its budget</p>
					</div>
				</div>
			{/if}
		</div>

		<!-- Column 3: Total Summary -->
		<div class="col-span-3">
			<!-- Budget Status Box -->
			<div class="mb-4 rounded-lg border bg-card shadow">
				<div class="relative p-6">
					<div class="absolute top-4 right-4">
						{#if allBudgetsSet}
							<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
						{:else}
							<CheckCircleIcon class="h-5 w-5 text-gray-300" />
						{/if}
					</div>
					<div class="flex flex-col items-center justify-center space-y-2">
						<SlidersHorizontalIcon class="h-5 w-5 text-muted-foreground" />
						<p class="text-lg font-semibold">
							Set {months.find((m) => m.value === selectedMonth.toString().padStart(2, '0'))
								?.label || 'Monthly'} Budget
						</p>
						{#if categoriesWithoutBudget.length > 0}
							<p class="text-sm text-muted-foreground">
								There is no budget set for {categoriesWithoutBudget.length}
								{categoriesWithoutBudget.length === 1 ? 'category' : 'categories'}.
							</p>
						{:else}
							<p class="text-sm text-muted-foreground">All budgets are set!</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Spending Overview Box -->
			<div class="rounded-lg border bg-card shadow">
				<div class="border-b p-6">
					<h3 class="text-lg font-semibold">
						{months.find((m) => m.value === selectedMonth.toString().padStart(2, '0'))?.label ||
							'Monthly'} Spending Overview
					</h3>
				</div>
				<div class="p-6">
					<div class="space-y-4">
						<SummaryRow label="Recurring Expenses" amount={totalRecurring} />
						<SummaryRow label="You Budgeted" amount={totalBudget} />
						<SummaryRow
							label="You Expect To Spend"
							amount={totalRecurring + totalBudget}
							emphasized={true}
							bordered={true}
							muted={false}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<CategoryDialog bind:open={openCategoryDialog} />
