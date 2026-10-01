<script lang="ts">
	import ReceiptsPage from '$lib/components/ReceiptsPage.svelte';
	import { formatCurrency } from '$lib/utils';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	function getYearlyAverageGasPerMonth(yearlyTotalAmount: number): number | null {
		const completedMonthsSinceJanuary = data.completedMonthsSinceJanuary ?? 0;

		if (data.yearlyTransactions.length === 0 || completedMonthsSinceJanuary <= 0) {
			return null;
		}

		return yearlyTotalAmount / completedMonthsSinceJanuary;
	}
</script>

<ReceiptsPage
	title="Fuel Receipts"
	description="Gas category transactions to track your GST"
	basePath="/receipts/fuel"
	{columns}
	amountLabel="Total Gas"
	monthlyTransactions={data.monthlyTransactions}
	yearlyTransactions={data.yearlyTransactions}
	form={data.form}
	loadError={data.loadError}
>
	{#snippet yearlyExtra(yearlyTotalAmount)}
		{@const average = getYearlyAverageGasPerMonth(yearlyTotalAmount)}
		<div class="mb-3 flex items-center justify-between">
			<span class="text-base font-medium">Monthly Average:</span>
			<span class="text-xl font-bold">{average === null ? '—' : formatCurrency(average)}</span>
		</div>
	{/snippet}
</ReceiptsPage>
