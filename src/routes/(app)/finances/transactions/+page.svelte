<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CategoryBudgetProgress from '$lib/components/CategoryBudgetProgress.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import type { transactionSchema } from '$lib/formSchemas';
	import { months } from '$lib/utils';

	import { columns } from './columns';

	import type { Budget, Transaction } from '$lib';

	interface Props {
		data: {
			transactions: Transaction[];
			budgets: Budget[];
			categorySpending: Record<string, number>;
			form: SuperValidated<z.infer<typeof transactionSchema>>;
			searchQuery: string;
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

	let searchDebounce: ReturnType<typeof setTimeout> | null = null;

	function onSearchInput(value: string) {
		searchInput = value;
		if (searchDebounce) clearTimeout(searchDebounce);
		searchDebounce = setTimeout(() => {
			const trimmed = value.trim().slice(0, 100);
			const url = trimmed
				? `/finances/transactions?search=${encodeURIComponent(trimmed)}&month=${selectedMonth}&year=${selectedYear}`
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

	// Sort budgets alphabetically by category name
	let sortedBudgets = $derived(
		[...data.budgets].sort((a, b) => {
			const nameA = a.category?.name || '';
			const nameB = b.category?.name || '';
			return nameA.localeCompare(nameB);
		})
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
					class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Search all transactions by payee or notes…"
					class="pl-9 {data.searchQuery ? 'pr-9' : ''}"
					value={searchInput}
					oninput={(e) => onSearchInput(e.currentTarget.value)}
				/>
				{#if data.searchQuery}
					<button
						type="button"
						onclick={clearSearch}
						class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						aria-label="Clear search"
					>
						<XIcon class="h-4 w-4" />
					</button>
				{/if}
			</div>
			{#if data.searchQuery}
				<p class="text-sm text-muted-foreground">
					{data.transactions.length}
					{data.transactions.length === 1 ? 'result' : 'results'} for "<span
						class="font-medium text-foreground">{data.searchQuery}</span
					>"
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
							<p class="mt-2 text-muted-foreground">
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
						<DataTable {columns} data={data.transactions as Transaction[]} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Card Column (hidden in search mode) -->
		{#if !data.searchQuery}
			<div class="lg:col-span-1">
				<div class="overflow-hidden rounded-lg border shadow">
					<div class="p-6">
						<h2 class="text-center text-2xl font-bold tracking-tight">Budget Summary</h2>
						<div class="my-4 border-t"></div>
						{#if sortedBudgets.length === 0}
							<p class="text-center text-sm text-muted-foreground">No budgets set for this month</p>
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
			</div>
		{/if}
	</div>
</div>

<TransactionModal
	bind:open={openModal}
	bind:isLoading={loading}
	categories={categories()}
	transactionForm={data.form}
/>
