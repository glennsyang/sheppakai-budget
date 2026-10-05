<script lang="ts">
	import type { Budget, ChartData } from '$lib';
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import PeriodPicker from '$lib/components/PeriodPicker.svelte';
	import PresetBudgetCard from '$lib/components/PresetBudgetCard.svelte';
	import SpendTrendChart from '$lib/components/SpendTrendChart.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getCategoriesContext } from '$lib/contexts';
	import { formatCurrency, monthNames } from '$lib/utils';
	import { categoryColorMap } from '$lib/utils/categoryColors';
	import { padMonth } from '$lib/utils/dates';
	import { useMonthYearParams } from '$lib/utils/monthYearParams.svelte';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedCategoryId = $state<string | null>(null);
	let editAmount = $state<string>('');
	let editingCustomAmount = $state<boolean>(false);
	// Track selected preset amount per category
	let categoryPresetSelections = $state<
		Record<string, 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom' | null>
	>({});

	// Calculate total recurring expenses
	let totalRecurring = $derived((data.recurring || []).reduce((sum, item) => sum + item.amount, 0));

	const monthYear = useMonthYearParams('/budget');
	let selectedMonth = $derived(monthYear.month);
	let selectedYear = $derived(monthYear.year);

	const categories = getCategoriesContext();

	// A month switch is a same-route navigation. Column 1 (the category list)
	// stays clickable; only the month-dependent columns skeleton.
	const reloading = usePendingReload();

	// Sort categories alphabetically
	let sortedCategories = $derived([...categories()].sort((a, b) => a.name.localeCompare(b.name)));

	// Get budget for a specific category
	function getBudgetForCategory(categoryId: string): Budget | undefined {
		return data.budget.find((b) => b.category?.id === categoryId);
	}

	// Calculate total budget for the month
	let totalBudget = $derived(data.budget.reduce((sum, b) => sum + b.amount, 0));

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
		if (!selectedCategoryId || !data.last12Months) {
			return [];
		}

		return data.last12Months.map((monthData) => {
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
				date: new Date(monthData.date),
				planned: budgetForMonth?.amount || 0,
				actual: transactionForMonth?.total || 0
			} as ChartData;
		});
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

		const prevMonthStr = padMonth(prevMonth.toString());
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

		const prevMonthStr = padMonth(prevMonth.toString());
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

	let categoryColors = $derived(categoryColorMap(sortedCategories));
	let monthName = $derived(monthNames[selectedMonth - 1]);
	let setCount = $derived(sortedCategories.length - categoriesWithoutBudget.length);

	let stats = $derived<Stat[]>([
		{ label: `Budgeted for ${monthName}`, value: formatCurrency(totalBudget) },
		{ label: 'Recurring bills', value: formatCurrency(totalRecurring) },
		{
			label: 'Expected spending',
			value: formatCurrency(totalRecurring + totalBudget),
			tooltip: 'Category budgets plus recurring bills.'
		},
		{
			label: 'Categories set',
			value: `${setCount} of ${sortedCategories.length}`,
			meter: sortedCategories.length > 0 ? (setCount / sortedCategories.length) * 100 : 0,
			subtext: allBudgetsSet
				? 'Every category has a budget'
				: `${categoriesWithoutBudget.length} still to set`
		}
	]);
</script>

<svelte:head>
	<title>Budget</title>
</svelte:head>

<PageShell
	title="Budget"
	subtitle="Plan what each category can spend in {monthName} {selectedYear}"
>
	{#snippet actions()}
		<PeriodPicker
			month={selectedMonth}
			year={selectedYear}
			onChange={monthYear.onMonthYearChange}
		/>
	{/snippet}

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		{#if reloading.current}
			<CardGridSkeleton cards={1} linesPerCard={1} lineClass="h-12" label="Loading budget totals" />
		{:else}
			<DashboardStatStrip {stats} />
		{/if}

		<div class="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
			<!-- Category list: a sticky rail at desk width, a picker on phones -->
			<nav
				aria-label="Categories"
				class="bg-card hidden overflow-hidden rounded-xl border shadow-sm lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:flex lg:max-h-[calc(100dvh-var(--header-height)-2rem)] lg:flex-col"
			>
				<h2 class="border-b px-4 py-3 text-sm font-semibold tracking-tight">Categories</h2>
				<ul class="min-h-0 flex-1 overflow-y-auto p-1.5">
					{#each sortedCategories as category (category.id)}
						{@const categoryBudget = getBudgetForCategory(category.id)}
						<li>
							<button
								class={[
									'focus-visible:ring-ring/50 flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-[3px]',
									selectedCategoryId === category.id
										? 'bg-accent text-accent-foreground'
										: 'hover:bg-muted/60'
								]}
								aria-current={selectedCategoryId === category.id ? 'true' : undefined}
								onclick={() => (selectedCategoryId = category.id)}
							>
								<span
									class="size-2 shrink-0 rounded-full"
									style:background={categoryColors.get(category.id)}
									aria-hidden="true"
								></span>
								<span class="flex-1 truncate font-medium">{category.name}</span>
								{#if categoryBudget}
									<span class="text-muted-foreground text-xs tabular-nums">
										{formatCurrency(categoryBudget.amount)}
									</span>
								{:else}
									<span class="text-muted-foreground/70 text-xs">Not set</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="flex min-w-0 flex-col gap-4">
				<div class="lg:hidden">
					<Select.Root
						type="single"
						value={selectedCategoryId ?? undefined}
						onValueChange={(v) => v && (selectedCategoryId = v)}
					>
						<Select.Trigger class="h-11 w-full" aria-label="Category">
							{#if selectedCategory}
								<span class="flex items-center gap-2">
									<span
										class="size-2 rounded-full"
										style:background={categoryColors.get(selectedCategory.id)}
										aria-hidden="true"
									></span>
									{selectedCategory.name}
								</span>
							{:else}
								Choose a category
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each sortedCategories as category (category.id)}
								{@const categoryBudget = getBudgetForCategory(category.id)}
								<Select.Item value={category.id} label={category.name}>
									<span class="flex w-full items-center gap-2">
										<span
											class="size-2 rounded-full"
											style:background={categoryColors.get(category.id)}
											aria-hidden="true"
										></span>
										<span class="flex-1">{category.name}</span>
										<span class="text-muted-foreground text-xs tabular-nums">
											{categoryBudget ? formatCurrency(categoryBudget.amount) : 'Not set'}
										</span>
									</span>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				{#if reloading.current}
					<CardGridSkeleton
						cards={2}
						linesPerCard={3}
						lineClass="h-10"
						class="flex flex-col gap-4"
						label="Loading category budget"
					/>
				{:else if selectedCategory}
					<section class="bg-card overflow-hidden rounded-xl border shadow-sm">
						<header
							class="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-5"
						>
							<div class="min-w-0">
								<h2 class="flex items-center gap-2 text-base font-semibold tracking-tight">
									<span
										class="size-2 shrink-0 rounded-full"
										style:background={categoryColors.get(selectedCategory.id)}
										aria-hidden="true"
									></span>
									<span class="truncate">{selectedCategory.name}</span>
								</h2>
								<p class="text-muted-foreground mt-0.5 text-xs">
									Pick a starting point for {monthName}. Choosing one saves it.
								</p>
							</div>
							<div class="sm:text-right">
								<p class="text-muted-foreground text-xs">Budget for {monthName}</p>
								<p class="text-xl font-semibold tracking-tight tabular-nums">
									{selectedBudget ? formatCurrency(selectedBudget.amount) : 'Not set'}
								</p>
							</div>
						</header>
						<div class="divide-y border-t" role="group" aria-label="Budget amount options">
							<PresetBudgetCard
								title="What I spent last month"
								amount={presetAmounts.lastMonthSpent}
								isSelected={selectedPresetAmount === 'lastMonth'}
								presetType="lastMonth"
								budgetId={selectedBudget?.id}
								{selectedMonth}
								{selectedYear}
								categoryId={selectedCategory.id}
								onSelect={() => selectPresetAmount('lastMonth', presetAmounts.lastMonthSpent)}
							/>
							<PresetBudgetCard
								title="What I budgeted last month"
								amount={presetAmounts.lastMonthBudget}
								isSelected={selectedPresetAmount === 'lastMonthBudget'}
								presetType="lastMonthBudget"
								budgetId={selectedBudget?.id}
								{selectedMonth}
								{selectedYear}
								categoryId={selectedCategory.id}
								onSelect={() =>
									selectPresetAmount('lastMonthBudget', presetAmounts.lastMonthBudget)}
							/>
							<PresetBudgetCard
								title="What I spend on average"
								amount={presetAmounts.averageSpent}
								isSelected={selectedPresetAmount === 'average'}
								presetType="average"
								budgetId={selectedBudget?.id}
								{selectedMonth}
								{selectedYear}
								categoryId={selectedCategory.id}
								onSelect={() => selectPresetAmount('average', presetAmounts.averageSpent)}
							/>
							<PresetBudgetCard
								title="Custom amount"
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
								onSaved={cancelEditing}
							/>
						</div>
					</section>

					<SpendTrendChart categoryName={selectedCategory.name} {chartData} />
				{:else}
					<section
						class="bg-card text-muted-foreground rounded-xl border px-6 py-12 text-center text-sm shadow-sm"
					>
						Add a category first, then set its budget here.
					</section>
				{/if}
			</div>
		</div>
	{/if}
</PageShell>
