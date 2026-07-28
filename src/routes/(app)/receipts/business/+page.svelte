<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Transaction } from '$lib';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		transactionFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);

	// Calculate monthly totals
	let monthlyTotalAmount = $derived(
		((data.monthlyTransactions as Transaction[]) || []).reduce((sum, item) => sum + item.amount, 0)
	);

	let monthlyTotalGst = $derived(
		((data.monthlyTransactions as Transaction[]) || []).reduce(
			(sum, item) => sum + (item.gstAmount ?? 0),
			0
		)
	);

	// Calculate yearly totals
	let yearlyTotalAmount = $derived(
		((data.yearlyTransactions as Transaction[]) || []).reduce((sum, item) => sum + item.amount, 0)
	);

	let yearlyTotalGst = $derived(
		((data.yearlyTransactions as Transaction[]) || []).reduce(
			(sum, item) => sum + (item.gstAmount ?? 0),
			0
		)
	);

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`${'/receipts/business'}?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`${'/receipts/business'}?month=${month}&year=${selectedYear}`, {
				keepFocus: true,
				replaceState: true
			});
		}
	}

	const categories = getCategoriesContext();
</script>

<svelte:head>
	<title>Business Receipts</title>
</svelte:head>

<MonthlyTablePageShell
	title="Business Receipts"
	description="Track your business expenses with GST"
	{selectedMonth}
	{selectedYear}
	{onMonthYearChange}
	{onMonthJump}
	mainClass="flex flex-col gap-6 lg:grid lg:grid-cols-4"
	tableColumnClass="lg:col-span-3"
	summaryColumnClass="lg:col-span-1"
	skeletonColumns={columns.length}
>
	{#snippet headerActions()}
		<Button size="sm" onclick={() => (openModal = true)}>
			<PlusIcon />
			Add
		</Button>
	{/snippet}

	{#snippet tableContent()}
		<DataTable {columns} data={data.monthlyTransactions} />
	{/snippet}

	{#snippet summaryContent()}
		<div class="flex flex-col gap-6">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Monthly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Total Amount:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalAmount)}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalGst)}</span>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Yearly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Total Amount:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalAmount)}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalGst)}</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</MonthlyTablePageShell>

<TransactionModal bind:open={openModal} categories={categories()} transactionForm={data.form!} />
