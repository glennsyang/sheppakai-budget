<script lang="ts">
	import type { PageProps } from './$types';
	import type { Category, Budget } from '$lib';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getContext } from 'svelte';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import PresetBudgetCard from '$lib/components/PresetBudgetCard.svelte';
	import SummaryRow from '$lib/components/SummaryRow.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { months } from '$lib/utils';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';

	let { data }: PageProps = $props();

	let openCategoryDialog = $state<boolean>(false);
	let selectedCategoryId = $state<string | null>(null);
	let editingBudgetId = $state<string | null>(null);
	let editAmount = $state<string>('');
	let editingCustomAmount = $state<boolean>(false);
	// Track selected preset amount per category
	let categoryPresetSelections = $state<
		Record<string, 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom' | null>
	>({});
	let customAmount = $state<string>('');

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

	// Set first category as selected by default
	$effect(() => {
		if (!selectedCategoryId && sortedCategories.length > 0) {
			selectedCategoryId = sortedCategories[0].id;
		}
	});

	// Auto-select preset based on budget data
	$effect(() => {
		if (selectedCategoryId && selectedBudget) {
			// If we haven't set a selection for this category yet, determine it automatically
			if (!categoryPresetSelections[selectedCategoryId]) {
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
				} else {
					// Budget is 0 or doesn't exist, default to lastMonthBudget
					categoryPresetSelections[selectedCategoryId] = 'lastMonthBudget';
				}
			}
		} else if (selectedCategoryId && !selectedBudget) {
			// No budget exists, default to lastMonthBudget
			if (!categoryPresetSelections[selectedCategoryId]) {
				categoryPresetSelections[selectedCategoryId] = 'lastMonthBudget';
			}
		}
	});

	function cancelEditing() {
		editingBudgetId = null;
		editAmount = '';
		editingCustomAmount = false;
		customAmount = '';
	}

	function startEditingCustomAmount() {
		editingCustomAmount = true;
		if (selectedCategoryId) {
			categoryPresetSelections[selectedCategoryId] = 'custom';
		}
		if (selectedBudget) {
			editingBudgetId = selectedBudget.id;
			editAmount = selectedBudget.amount.toString();
		} else {
			editAmount = '';
		}
	}

	// Calculate preset amounts for the selected category
	function getLastMonthSpent(categoryId: string): number {
		// TODO: Implement actual calculation from expenses
		return 0;
	}

	function getLastMonthBudget(categoryId: string): number {
		// TODO: Implement actual calculation from previous month's budget
		return 0;
	}

	function getAverageSpent(categoryId: string): number {
		// TODO: Implement actual calculation from expenses history
		return 0;
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
		if (type === 'custom') {
			customAmount = '';
		} else {
			editAmount = amount.toString();
		}
	}
</script>

<svelte:head>
	<title>Budgets - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header with Month Switcher -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-4">
				<div>
					<MonthYearSwitcher
						currentMonth={selectedMonth}
						currentYear={selectedYear}
						currentType={'budget'}
						onMonthChange={onMonthYearChange}
					/>
				</div>
			</div>
			<div class="w-44">
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
					<div class="max-h-[600px] overflow-y-auto">
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
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('average', presetAmounts.averageSpent)}
					/>

					<!-- Custom Amount -->
					<PresetBudgetCard
						title="Custom"
						amount={selectedBudget ? selectedBudget.amount : 0}
						isSelected={selectedPresetAmount === 'custom'}
						isCustom={true}
						isEditing={editingCustomAmount}
						{editAmount}
						budgetId={selectedBudget?.id}
						{selectedMonth}
						{selectedYear}
						categoryId={selectedCategory.id}
						onSelect={() => selectPresetAmount('custom', 0)}
						onEdit={startEditingCustomAmount}
						onCancel={cancelEditing}
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
