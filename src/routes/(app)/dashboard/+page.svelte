<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { SimpleTable } from '$lib';
	import type { Expense, Income } from '$lib';
	import type { PageProps } from './$types';
	import { expenseColumns, incomeColumns } from './columns';
	import { Button } from '$lib/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ExpenseModal from '$lib/components/ExpenseModal.svelte';
	import IncomeModal from '$lib/components/IncomeModal.svelte';

	let { data }: PageProps = $props();

	let expenses: Expense[] = data.expenses || [];
	let income: Income[] = data.income || [];
	let totalExpenses: number = data.totalExpenses || 0;
	let totalIncome: number = data.totalIncome || 0;

	let loading: boolean = false;
	let openExpenseModal = $state<boolean>(false);
	let openIncomeModal = $state<boolean>(false);
</script>

<svelte:head>
	<title>Dashboard - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="mt-2 text-muted-foreground">Overview of your budget and expenses</p>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="overflow-hidden rounded-lg border shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium">Income</h2>
				{#if loading}
					<Skeleton class="mb-2 h-2 w-full" />
					<Skeleton class="h-4 w-20" />
				{:else}
					<Progress value={totalIncome - totalExpenses} max={totalIncome} class="mb-2" />
					<p class="text-sm text-muted-foreground">${totalIncome.toFixed(2)}</p>
				{/if}
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium">Expenses</h2>
				{#if loading}
					<Skeleton class="mb-2 h-2 w-full" />
					<Skeleton class="h-4 w-20" />
				{:else}
					<Progress value={totalExpenses} max={totalIncome + totalExpenses} class="mb-2" />
					<p class="text-sm text-muted-foreground">${totalExpenses.toFixed(2)}</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Recent Expenses Table -->
	<div class="mt-8 overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-medium">Recent Expenses</h2>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openExpenseModal = true)}>
						<PlusIcon />
					</Button>
					<Button size="sm">
						<a href="/expenses" class="text-sm">More</a>
					</Button>
				</div>
			</div>
			<SimpleTable
				data={expenses}
				columns={expenseColumns}
				{loading}
				title=""
				caption="A list of your recent expenses."
				emptyMessage="No expenses recorded yet."
			/>
		</div>
	</div>

	<!-- Recent Income Table -->
	<div class="mt-8 overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-medium">Recent Income</h2>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openIncomeModal = true)}>
						<PlusIcon />
					</Button>
					<Button size="sm">
						<a href="/income" class="text-sm">More</a>
					</Button>
				</div>
			</div>
			<SimpleTable
				data={income}
				columns={incomeColumns}
				{loading}
				title=""
				caption="A list of your recent income."
				emptyMessage="No income recorded yet."
			/>
		</div>
	</div>
</div>

<ExpenseModal bind:open={openExpenseModal} />

<IncomeModal bind:open={openIncomeModal} />
