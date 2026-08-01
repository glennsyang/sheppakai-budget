<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Income } from '$lib';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { incomeFormContext } from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import { getCurrentPacificMonthYear } from '$lib/utils/dates';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		incomeFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);

	// Calculate monthly total income
	let monthlyTotalIncome = $derived(
		((data.monthlyIncomes as Income[]) || []).reduce((sum, item) => sum + item.amount, 0)
	);

	// Calculate yearly total income
	let yearlyTotalIncome = $derived(
		((data.yearlyIncomes as Income[]) || []).reduce((sum, item) => sum + item.amount, 0)
	);

	let yearlyAverageIncomePerMonth = $derived.by(() => {
		const hasIncomes = ((data.yearlyIncomes as Income[]) || []).length > 0;
		const completedMonthsSinceJanuary = data.completedMonthsSinceJanuary ?? 0;

		if (!hasIncomes || completedMonthsSinceJanuary <= 0) {
			return null;
		}

		return yearlyTotalIncome / completedMonthsSinceJanuary;
	});

	const { month: defaultMonth, year: defaultYear } = getCurrentPacificMonthYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`${'/income'}?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`${'/income'}?month=${month}&year=${selectedYear}`, {
				keepFocus: true,
				replaceState: true
			});
		}
	}
</script>

<svelte:head>
	<title>Income</title>
</svelte:head>

<MonthlyTablePageShell
	title="Income"
	description="Manage your income sources"
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
		<DataTable {columns} data={data.monthlyIncomes} />
	{/snippet}

	{#snippet summaryContent()}
		<div class="flex flex-col gap-6">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Monthly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total Income: </span>
						<span class="text-2xl font-bold">{formatCurrency(monthlyTotalIncome)}</span>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Yearly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Total Income: </span>
						<span class="text-2xl font-bold">{formatCurrency(yearlyTotalIncome)}</span>
					</div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">Monthly Average:</span>
						<span class="text-xl font-bold"
							>{yearlyAverageIncomePerMonth === null
								? '—'
								: formatCurrency(yearlyAverageIncomePerMonth)}</span
						>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</MonthlyTablePageShell>

<IncomeModal bind:open={openModal} incomeForm={data.form!} />
