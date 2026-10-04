<script lang="ts">
	import type { Stat } from '$lib/components/DashboardStatStrip.svelte';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { incomeFormContext } from '$lib/contexts';
	import { formatCurrency, monthNames } from '$lib/utils';
	import { formatDayHeading } from '$lib/utils/dates';
	import { useMonthYearParams } from '$lib/utils/monthYearParams.svelte';
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
		data.monthlyIncomes.reduce((sum, item) => sum + item.amount, 0)
	);

	// Calculate yearly total income
	let yearlyTotalIncome = $derived(data.yearlyIncomes.reduce((sum, item) => sum + item.amount, 0));

	let yearlyAverageIncomePerMonth = $derived.by(() => {
		const hasIncomes = data.yearlyIncomes.length > 0;
		const completedMonthsSinceJanuary = data.completedMonthsSinceJanuary ?? 0;

		if (!hasIncomes || completedMonthsSinceJanuary <= 0) {
			return null;
		}

		return yearlyTotalIncome / completedMonthsSinceJanuary;
	});

	const monthYear = useMonthYearParams('/income');

	let periodLabel = $derived(`${monthNames[monthYear.month - 1]} ${monthYear.year}`);

	let stats = $derived<Stat[]>([
		{
			label: `Income in ${monthNames[monthYear.month - 1]}`,
			value: formatCurrency(monthlyTotalIncome)
		},
		{ label: `Income in ${monthYear.year}`, value: formatCurrency(yearlyTotalIncome) },
		{
			label: 'Monthly average',
			value:
				yearlyAverageIncomePerMonth === null ? '—' : formatCurrency(yearlyAverageIncomePerMonth),
			subtext: 'Completed months this year'
		}
	]);
</script>

<svelte:head>
	<title>Income</title>
</svelte:head>

<MonthlyTablePageShell
	title="Income"
	subtitle="Pay, side-business deposits and anything else coming in"
	loadError={data.loadError}
	selectedMonth={monthYear.month}
	selectedYear={monthYear.year}
	onMonthYearChange={monthYear.onMonthYearChange}
	{stats}
	skeletonColumns={columns.length}
>
	{#snippet primaryAction()}
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			Add income
		</Button>
	{/snippet}

	{#snippet tableContent()}
		<DataTable
			{columns}
			data={data.monthlyIncomes}
			mobileGroupBy={(i) => formatDayHeading(i.date)}
			emptyMessage={`No income recorded for ${periodLabel} yet.`}
		/>
	{/snippet}
</MonthlyTablePageShell>

<IncomeModal bind:open={openModal} incomeForm={data.form} />
