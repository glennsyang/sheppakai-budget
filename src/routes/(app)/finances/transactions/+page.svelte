<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { getContext, setContext } from 'svelte';
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
	import type { transactionSchema } from '$lib/formSchemas';
	import { months } from '$lib/utils';

	import { columns } from './columns';

	import type { Budget, Category, Transaction } from '$lib';

	interface Props {
		data: {
			transactions: Transaction[];
			budgets: Budget[];
			categorySpending: Record<string, number>;
			transactionForm: SuperValidated<z.infer<typeof transactionSchema>>;
		};
	}

	let { data }: Props = $props();

	// Provide transactionForm to data-table-actions
	setContext('transactionForm', data.transactionForm);

	let openModal = $state<boolean>(false);
	let loading = $state(false);

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

	const categories = getContext('categories') as () => Category[];

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

	<div class="flex flex-col gap-6 lg:grid lg:grid-cols-4">
		<!-- Table Column (larger) -->
		<div class="lg:col-span-3">
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
						<DataTable {columns} data={data.transactions as Transaction[]} showCategoryFilter />
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Card Column -->
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
	</div>
</div>

<TransactionModal
	bind:open={openModal}
	bind:isLoading={loading}
	categories={categories()}
	transactionForm={data.transactionForm}
/>
