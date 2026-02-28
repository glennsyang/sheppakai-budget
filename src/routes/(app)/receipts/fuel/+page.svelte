<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import { formatCurrency, months } from '$lib/utils';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	import type { Transaction } from '$lib';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		transactionFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);
	let loading = $state(false);

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

	let yearlyAverageGasPerMonth = $derived.by(() => {
		const hasTransactions = ((data.yearlyTransactions as Transaction[]) || []).length > 0;
		const completedMonthsSinceJanuary = data.completedMonthsSinceJanuary ?? 0;

		if (!hasTransactions || completedMonthsSinceJanuary <= 0) {
			return null;
		}

		return yearlyTotalAmount / completedMonthsSinceJanuary;
	});

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`${'/receipts/fuel'}?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`${'/receipts/fuel'}?month=${month}&year=${selectedYear}`, {
				keepFocus: true,
				replaceState: true
			});
		}
	}

	const categories = getCategoriesContext();
</script>

<svelte:head>
	<title>Fuel Receipts</title>
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
							<h1 class="text-3xl font-bold tracking-tight">Fuel Receipts</h1>
							<p class="mt-2 text-muted-foreground">Gas category transactions to track your GST</p>
						</div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add
							</Button>
						</div>
					</div>
					{#if loading}
						<TableSkeleton rows={5} columns={5} />
					{:else}
						<DataTable {columns} data={data.monthlyTransactions} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Cards Column -->
		<div class="lg:col-span-1">
			<!-- Monthly Summary Card -->
			<div class="mb-6 overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Monthly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Total Gas:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalAmount)}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalGst)}</span>
					</div>
				</div>
			</div>

			<!-- Yearly Summary Card -->
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Yearly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Total Gas:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalAmount)}</span>
					</div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Monthly Average:</span>
						<span class="text-xl font-bold"
							>{yearlyAverageGasPerMonth === null
								? '—'
								: formatCurrency(yearlyAverageGasPerMonth)}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalGst)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<TransactionModal
	bind:open={openModal}
	bind:isLoading={loading}
	transactionForm={data.form!}
	categories={categories()}
/>
