<script lang="ts">
	import ReceiptsPage from '$lib/components/ReceiptsPage.svelte';
	import { formatCurrency } from '$lib/utils';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	function averagePerMonth(yearlyTotalAmount: number) {
		const completedMonthsSinceJanuary = data.completedMonthsSinceJanuary ?? 0;
		const average =
			data.yearlyTransactions.length === 0 || completedMonthsSinceJanuary <= 0
				? null
				: yearlyTotalAmount / completedMonthsSinceJanuary;

		return [
			{
				label: 'Monthly average',
				value: average === null ? '—' : formatCurrency(average),
				subtext: 'Completed months this year'
			}
		];
	}
</script>

<ReceiptsPage
	title="Fuel receipts"
	subtitle="Gas purchases and the GST on them, for the business books"
	basePath="/receipts/fuel"
	{columns}
	amountLabel="Fuel"
	addLabel="Add fuel receipt"
	monthlyTransactions={data.monthlyTransactions}
	yearlyTransactions={data.yearlyTransactions}
	form={data.form}
	loadError={data.loadError}
	yearlyExtra={averagePerMonth}
/>
