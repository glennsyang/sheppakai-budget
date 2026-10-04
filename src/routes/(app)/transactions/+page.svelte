<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Budget, Transaction } from '$lib';
	import CategoryBudgetProgress from '$lib/components/CategoryBudgetProgress.svelte';
	import type { Stat } from '$lib/components/DashboardStatStrip.svelte';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import type { transactionSchema } from '$lib/formSchemas';
	import { formatCurrency, monthNames } from '$lib/utils';
	import { categoryColorMap } from '$lib/utils/categoryColors';
	import { formatDayHeading } from '$lib/utils/dates';
	import { useMonthYearParams } from '$lib/utils/monthYearParams.svelte';
	import { calculateTransactionSummary } from '$lib/utils/transaction-summary';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';

	import type { PageProps } from './$types';
	import { createColumns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		transactionFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);

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
				? `/transactions?search=${encodeURIComponent(trimmed)}`
				: `/transactions?month=${monthYear.month}&year=${monthYear.year}`;
			goto(url, { keepFocus: true, replaceState: true });
		}, 500);
	}

	function clearSearch() {
		goto(`/transactions?month=${monthYear.month}&year=${monthYear.year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	const monthYear = useMonthYearParams('/transactions');

	const categories = getCategoriesContext();
	let excludedFromBudgetTotal = $derived(data.excludedFromBudgetTotal ?? 0);

	let categoryColors = $derived(categoryColorMap(categories()));
	let columns = $derived(createColumns(categoryColors));

	// Excluded transactions stay listed but read as secondary to the budgeted ones.
	function getTransactionRowClass(transaction: Transaction) {
		return transaction.excludedFromBudget ? 'text-muted-foreground' : '';
	}

	// Sort budgets alphabetically by category name
	let sortedBudgets = $derived(
		[...data.budgets].sort((a, b) => {
			const nameA = a.category?.name || '';
			const nameB = b.category?.name || '';
			return nameA.localeCompare(nameB);
		})
	);

	let periodLabel = $derived(`${monthNames[monthYear.month - 1]} ${monthYear.year}`);

	let subtitle = $derived.by(() => {
		if (data.searchQuery) {
			const n = data.transactions.length;
			const more = data.searchLimitReached ? ' (first results only, refine to see more)' : '';
			return `${n} ${n === 1 ? 'result' : 'results'} for “${data.searchQuery}” across all months${more}`;
		}
		const n = data.transactions.length;
		return `${n} ${n === 1 ? 'transaction' : 'transactions'} in ${periodLabel}`;
	});

	let summary = $derived(
		calculateTransactionSummary(
			data.transactions,
			data.yearlyTransactions,
			data.completedMonthsSinceJanuary
		)
	);

	let stats = $derived<Stat[]>([
		{
			label: `Spent in ${monthNames[monthYear.month - 1]}`,
			value: formatCurrency(summary.monthlyTotal)
		},
		{
			label: 'Excluded from budget',
			value: formatCurrency(excludedFromBudgetTotal),
			tooltip: 'Tracked and searchable, but not counted in budget totals.'
		},
		{ label: `Spent in ${monthYear.year}`, value: formatCurrency(summary.yearlyTotal) },
		{
			label: 'Monthly average',
			value: summary.monthlyAverage === null ? '—' : formatCurrency(summary.monthlyAverage),
			subtext: 'Completed months this year'
		}
	]);
</script>

<svelte:head>
	<title>Transactions</title>
</svelte:head>

<MonthlyTablePageShell
	title="Transactions"
	{subtitle}
	loadError={data.loadError}
	selectedMonth={monthYear.month}
	selectedYear={monthYear.year}
	onMonthYearChange={monthYear.onMonthYearChange}
	showSummary={!data.searchQuery}
	{stats}
	skeletonColumns={columns.length}
>
	{#snippet primaryAction()}
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			Add transaction
		</Button>
	{/snippet}

	{#snippet tableContent()}
		<DataTable
			{columns}
			data={data.transactions}
			defaultPageSize={20}
			searchable={false}
			rowClassName={getTransactionRowClass}
			mobileGroupBy={(t) => formatDayHeading(t.date)}
			emptyMessage={data.searchQuery
				? 'No transactions match that search.'
				: `No transactions in ${periodLabel} yet.`}
		>
			{#snippet toolbar()}
				<div class="relative max-w-md">
					<SearchIcon
						class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
						aria-hidden="true"
					/>
					<Input
						type="search"
						placeholder="Search all transactions…"
						aria-label="Search transactions"
						class={['h-11 pl-9 md:h-9', data.searchQuery && 'pr-11 md:pr-9']}
						value={searchInput}
						oninput={(e) => onSearchInput(e.currentTarget.value)}
					/>
					{#if data.searchQuery}
						<button
							type="button"
							onclick={clearSearch}
							class="text-muted-foreground hover:text-foreground absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center md:size-9"
							aria-label="Clear search"
						>
							<XIcon class="size-4" />
						</button>
					{/if}
				</div>
			{/snippet}
		</DataTable>
	{/snippet}

	{#snippet summaryContent()}
		<section class="bg-card overflow-hidden rounded-xl border shadow-sm">
			<header class="px-4 pt-4 pb-2 sm:px-5">
				<h2 class="text-base font-semibold tracking-tight">Budget by category</h2>
				<p class="text-muted-foreground text-xs">Spent so far against this month's plan</p>
			</header>
			{#if sortedBudgets.length === 0}
				<p class="text-muted-foreground px-4 pt-2 pb-5 text-sm sm:px-5">
					No budgets set for {periodLabel}.
					<a href="/budget" class="text-primary font-medium hover:underline">Set them</a>
				</p>
			{:else}
				<div class="pb-2 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:block">
					{#each sortedBudgets as budgetItem (budgetItem.id)}
						{#if budgetItem.category}
							<CategoryBudgetProgress
								categoryName={budgetItem.category.name}
								spent={data.categorySpending[budgetItem.category.id] || 0}
								budgeted={budgetItem.amount}
								color={categoryColors.get(budgetItem.category.id)}
							/>
						{/if}
					{/each}
				</div>
			{/if}
		</section>
	{/snippet}
</MonthlyTablePageShell>

<TransactionModal bind:open={openModal} transactionForm={data.form} categories={categories()} />
