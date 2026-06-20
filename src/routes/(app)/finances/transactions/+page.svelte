<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Budget, Transaction } from '$lib';
	import CategoryBudgetProgress from '$lib/components/CategoryBudgetProgress.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import type { transactionSchema } from '$lib/formSchemas';
	import { formatCurrency, months } from '$lib/utils';
	import { calculateTransactionSummary } from '$lib/utils/transaction-summary';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { columns } from './columns';

	interface Props {
		data: {
			transactions: Transaction[];
			budgets: Budget[];
			categorySpending: Record<string, number>;
			excludedFromBudgetTotal?: number;
			yearlyTransactions: Transaction[];
			completedMonthsSinceJanuary: number;
			form: SuperValidated<z.infer<typeof transactionSchema>>;
			searchQuery: string;
			searchLimitReached?: boolean;
		};
	}

	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		transactionFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	// svelte-ignore state_referenced_locally
	let searchInput = $state(data.searchQuery ?? '');
	$effect(() => {
		searchInput = data.searchQuery ?? '';
	});

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Prevent a stale goto() from firing after the component is destroyed (e.g. the user
	// types in the search box and navigates away before the 500 ms debounce elapses).
	$effect(() => () => {
		if (debounceTimer) clearTimeout(debounceTimer);
	});

	// Matches the longest searchable transaction field max length defined in the transaction
	// schema. Payee is capped at 100 characters, but notes can be up to 800 characters, so the
	// search query must allow up to 800 characters to avoid truncating valid note searches before
	// they reach the server.
	const MAX_SEARCH_QUERY_LENGTH = 800;

	function onSearchInput(value: string) {
		searchInput = value;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			const trimmed = value.trim().slice(0, MAX_SEARCH_QUERY_LENGTH);
			const url = trimmed
				? `/finances/transactions?search=${encodeURIComponent(trimmed)}`
				: `/finances/transactions?month=${selectedMonth}&year=${selectedYear}`;
			goto(url, { keepFocus: true, replaceState: true });
		}, 500);
	}

	function clearSearch() {
		goto(`/finances/transactions?month=${selectedMonth}&year=${selectedYear}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`${'/finances/transactions'}?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`${'/finances/transactions'}?month=${month}&year=${selectedYear}`, {
				keepFocus: true,
				replaceState: true
			});
		}
	}

	const categories = getCategoriesContext();
	let excludedFromBudgetTotal = $derived(data.excludedFromBudgetTotal ?? 0);

	function getTransactionRowClass(transaction: Transaction) {
		if (!transaction.excludedFromBudget) return '';
		return 'bg-amber-50 hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:[&,&>svelte-css-wrapper]:[&>th,td]:bg-amber-950/35';
	}

	// Sort budgets alphabetically by category name
	let sortedBudgets = $derived(
		[...data.budgets].sort((a, b) => {
			const nameA = a.category?.name || '';
			const nameB = b.category?.name || '';
			return nameA.localeCompare(nameB);
		})
	);

	let summary = $derived(
		calculateTransactionSummary(
			data.transactions,
			data.yearlyTransactions,
			data.completedMonthsSinceJanuary
		)
	);
</script>

<svelte:head>
	<title>Transactions</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex flex-col gap-3">
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
			<!-- Global transaction search -->
			<div class="relative">
				<SearchIcon
					class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
				/>
				<Input
					type="search"
					placeholder="Search all transactions by payee or notes…"
					aria-label="Search transactions"
					class="pl-9 {data.searchQuery ? 'pr-9' : ''}"
					value={searchInput}
					oninput={(e) => onSearchInput(e.currentTarget.value)}
				/>
				{#if data.searchQuery}
					<button
						type="button"
						onclick={clearSearch}
						class="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
						aria-label="Clear search"
					>
						<XIcon class="h-4 w-4" />
					</button>
				{/if}
			</div>
			{#if data.searchQuery}
				<p class="text-muted-foreground text-sm">
					{data.transactions.length}
					{data.transactions.length === 1 ? 'result' : 'results'} for "<span
						class="text-foreground font-medium">{data.searchQuery}</span
					>"{#if data.searchLimitReached}
						— showing first {data.transactions.length}; refine your search to see more{/if}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex flex-col gap-6 {data.searchQuery ? '' : 'lg:grid lg:grid-cols-4'}">
		<!-- Table Column (larger) -->
		<div class={data.searchQuery ? '' : 'lg:col-span-3'}>
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight">Transactions</h1>
							<p class="text-muted-foreground mt-2">
								Manage your daily financial transactions and expenses
							</p>
						</div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add
							</Button>
						</div>
					</div>
					{#if loading}
						<TableSkeleton rows={5} columns={4} />
					{:else}
						<DataTable
							{columns}
							data={data.transactions as Transaction[]}
							rowClassName={getTransactionRowClass}
						/>
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Card Column (hidden in search mode) -->
		{#if !data.searchQuery}
			<div class="lg:col-span-1">
				<div class="mb-6 overflow-hidden rounded-lg border shadow">
					<div class="p-6">
						<h2 class="text-center text-2xl font-bold tracking-tight">Budget Summary</h2>
						<div
							class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/25"
						>
							<div class="flex items-center justify-between text-sm font-medium">
								<span>Excluded</span>
								<span class="tabular-nums">{formatCurrency(excludedFromBudgetTotal)}</span>
							</div>
							<p class="text-muted-foreground mt-1 text-xs">
								Tracked separately and not counted in budget totals.
							</p>
						</div>
						<div class="my-4 border-t"></div>
						{#if sortedBudgets.length === 0}
							<p class="text-muted-foreground text-center text-sm">No budgets set for this month</p>
						{:else}
							{#each sortedBudgets as budgetItem (budgetItem.id)}
								{#if budgetItem.category}
									<CategoryBudgetProgress
										categoryName={budgetItem.category.name}
										spent={data.categorySpending[budgetItem.category.id] || 0}
										budgeted={budgetItem.amount}
									/>
								{/if}
							{/each}
						{/if}
					</div>
				</div>

				<!-- Monthly Summary Card -->
				<div class="mb-6 overflow-hidden rounded-lg border shadow">
					<div class="p-6">
						<h2 class="text-center text-2xl font-bold tracking-tight">Monthly Summary</h2>
						<div class="my-4 border-t"></div>
						<div class="flex items-center justify-between">
							<span class="text-base font-medium">Total Spending:</span>
							<span class="text-2xl font-bold">{formatCurrency(summary.monthlyTotal)}</span>
						</div>
					</div>
				</div>

				<!-- Yearly Summary Card -->
				<div class="overflow-hidden rounded-lg border shadow">
					<div class="p-6">
						<h2 class="text-center text-2xl font-bold tracking-tight">Yearly Summary</h2>
						<div class="my-4 border-t"></div>
						<div class="mb-3 flex items-center justify-between">
							<span class="text-base font-medium">Total Spending:</span>
							<span class="text-2xl font-bold">{formatCurrency(summary.yearlyTotal)}</span>
						</div>
						<div class="mb-3 flex items-center justify-between">
							<span class="text-base font-medium">Monthly Average:</span>
							<span class="text-xl font-bold"
								>{summary.monthlyAverage === null
									? '—'
									: formatCurrency(summary.monthlyAverage)}</span
							>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<TransactionModal bind:open={openModal} categories={categories()} transactionForm={data.form} />
