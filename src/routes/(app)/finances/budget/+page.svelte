<script lang="ts">
	import type { PageProps } from './$types';
	import type { Category, Budget } from '$lib';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import HelpCircleIcon from '@lucide/svelte/icons/help-circle';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input';
	import { getContext } from 'svelte';
	import BudgetModal from '$lib/components/BudgetModal.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { months } from '$lib/utils';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);
	let selectedCategoryId = $state<string | null>(null);
	let editingBudgetId = $state<string | null>(null);
	let editAmount = $state<string>('');
	let selectedPresetAmount = $state<'lastMonth' | 'lastMonthBudget' | 'average' | 'custom' | null>(
		null
	);
	let customAmount = $state<string>('');

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

	// Get selected category details
	let selectedCategory = $derived(
		selectedCategoryId ? categories().find((c) => c.id === selectedCategoryId) : null
	);

	let selectedBudget = $derived(
		selectedCategoryId ? getBudgetForCategory(selectedCategoryId) : null
	);

	// Set first category as selected by default
	$effect(() => {
		if (!selectedCategoryId && sortedCategories.length > 0) {
			selectedCategoryId = sortedCategories[0].id;
		}
	});

	function startEditing(budgetId: string, currentAmount: number) {
		editingBudgetId = budgetId;
		editAmount = currentAmount.toString();
	}

	function cancelEditing() {
		editingBudgetId = null;
		editAmount = '';
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
		selectedPresetAmount = type;
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
	<div class="grid grid-cols-12 gap-6">
		<!-- Column 1: Category List -->
		<div class="col-span-3">
			<div class="rounded-lg border bg-card shadow">
				<div class="border-b p-6">
					<h3 class="text-lg font-semibold">Categories</h3>
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
		<div class="col-span-6">
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
					<button
						class="relative rounded-lg border bg-card p-4 shadow transition-all hover:border-primary"
						onclick={() => selectPresetAmount('lastMonth', presetAmounts.lastMonthSpent)}
					>
						<div class="absolute top-2 right-2">
							{#if selectedPresetAmount === 'lastMonth'}
								<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
							{:else}
								<CheckCircleIcon class="h-5 w-5 text-gray-300" />
							{/if}
						</div>
						<div class="flex flex-col items-center justify-center space-y-2 pt-2">
							<p class="text-2xl font-bold">${presetAmounts.lastMonthSpent.toFixed(2)}</p>
							<p class="text-center text-sm text-muted-foreground">Last month spent</p>
						</div>
					</button>

					<!-- Last Month Budget -->
					<button
						class="relative rounded-lg border bg-card p-4 shadow transition-all hover:border-primary"
						onclick={() => selectPresetAmount('lastMonthBudget', presetAmounts.lastMonthBudget)}
					>
						<div class="absolute top-2 right-2">
							{#if selectedPresetAmount === 'lastMonthBudget'}
								<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
							{:else}
								<CheckCircleIcon class="h-5 w-5 text-gray-300" />
							{/if}
						</div>
						<div class="flex flex-col items-center justify-center space-y-2 pt-2">
							<p class="text-2xl font-bold">${presetAmounts.lastMonthBudget.toFixed(2)}</p>
							<p class="text-center text-sm text-muted-foreground">Last month budget</p>
						</div>
					</button>

					<!-- Average Spent -->
					<button
						class="relative rounded-lg border bg-card p-4 shadow transition-all hover:border-primary"
						onclick={() => selectPresetAmount('average', presetAmounts.averageSpent)}
					>
						<div class="absolute top-2 right-2">
							{#if selectedPresetAmount === 'average'}
								<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
							{:else}
								<CheckCircleIcon class="h-5 w-5 text-gray-300" />
							{/if}
						</div>
						<div class="flex flex-col items-center justify-center space-y-2 pt-2">
							<p class="text-2xl font-bold">${presetAmounts.averageSpent.toFixed(2)}</p>
							<p class="text-center text-sm text-muted-foreground">Average spent</p>
						</div>
					</button>
					<!-- Custom Amount -->
					<button
						class="relative rounded-lg border bg-card p-4 shadow transition-all hover:border-primary"
						onclick={() => selectPresetAmount('custom', 0)}
					>
						<div class="absolute top-2 right-2">
							{#if selectedPresetAmount === 'custom'}
								<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
							{:else}
								<CheckCircleIcon class="h-5 w-5 text-gray-300" />
							{/if}
						</div>
						<div class="flex flex-col items-center justify-center space-y-2 pt-2">
							{#if selectedPresetAmount === 'custom'}
								<Input
									type="number"
									bind:value={customAmount}
									step="0.01"
									min="0"
									class="h-8 w-full text-center text-xl font-bold"
									placeholder="0.00"
								/>
							{:else}
								<p class="text-2xl font-bold">$0.00</p>
							{/if}
							<p class="text-center text-sm text-muted-foreground">Custom amount</p>
						</div>
					</button>
				</div>

				<!-- Budget Details Card -->
				<div class="rounded-lg border bg-card shadow">
					<div class="border-b p-6">
						<div class="flex items-center justify-between">
							<h3 class="text-lg font-semibold">Budget Details</h3>
							{#if selectedBudget}
								<Button size="sm" onclick={() => (openModal = true)}>
									<PlusIcon class="mr-2 h-4 w-4" />
									Edit Budget
								</Button>
							{:else}
								<Button size="sm" onclick={() => (openModal = true)}>
									<PlusIcon class="mr-2 h-4 w-4" />
									Add Budget
								</Button>
							{/if}
						</div>
					</div>
					<div class="p-6">
						{#if selectedBudget}
							<div class="space-y-4">
								<div>
									<p class="text-sm font-medium text-muted-foreground">Budgeted Amount</p>
									{#if editingBudgetId === selectedBudget.id}
										<form method="POST" action="?/update" class="mt-2 flex gap-2">
											<input type="hidden" name="id" value={selectedBudget.id} />
											<input
												type="hidden"
												name="month"
												value={selectedMonth.toString().padStart(2, '0')}
											/>
											<input type="hidden" name="year" value={selectedYear.toString()} />
											<input type="hidden" name="categoryId" value={selectedCategory.id} />
											<Input
												type="number"
												name="amount"
												bind:value={editAmount}
												step="0.01"
												min="0"
												class="w-48"
											/>
											<Button type="submit" size="sm">Save</Button>
											<Button type="button" size="sm" variant="outline" onclick={cancelEditing}>
												Cancel
											</Button>
										</form>
									{:else}
										<div class="mt-2 flex items-center gap-4">
											<p class="text-2xl font-bold">${selectedBudget.amount.toFixed(2)}</p>
											<Button
												size="sm"
												variant="outline"
												onclick={() => startEditing(selectedBudget.id, selectedBudget.amount)}
											>
												Edit
											</Button>
											<form method="POST" action="?/delete" class="inline">
												<input type="hidden" name="id" value={selectedBudget.id} />
												<Button type="submit" size="sm" variant="destructive">Delete</Button>
											</form>
										</div>
									{/if}
								</div>
							</div>
						{:else}
							<div class="py-12 text-center">
								<p class="mb-4 text-muted-foreground">No budget set for this category</p>
								<Button onclick={() => (openModal = true)}>
									<PlusIcon class="mr-2 h-4 w-4" />
									Add Budget
								</Button>
							</div>
						{/if}
					</div>
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
			<div class="rounded-lg border bg-card shadow">
				<div class="border-b p-6">
					<h3 class="text-lg font-semibold">Monthly Total</h3>
				</div>
				<div class="p-6">
					<div class="space-y-4">
						<div>
							<p class="text-sm font-medium text-muted-foreground">Total Budget</p>
							<p class="text-3xl font-bold">${totalBudget.toFixed(2)}</p>
						</div>
						<div class="rounded-lg bg-muted p-4">
							<p class="mb-2 text-sm font-medium">Budget Breakdown</p>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span>Categories with Budget:</span>
									<span class="font-medium">{(data.budget as Budget[]).length}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span>Total Categories:</span>
									<span class="font-medium">{categories().length}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<BudgetModal bind:open={openModal} categories={categories()} />
