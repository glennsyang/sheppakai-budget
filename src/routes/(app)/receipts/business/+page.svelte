<script lang="ts">
	import ReceiptsPage from '$lib/components/ReceiptsPage.svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();
</script>

<ReceiptsPage
	title="Business Receipts"
	description="Track your business expenses with GST"
	basePath="/receipts/business"
	{columns}
	amountLabel="Total Amount"
	monthlyTransactions={data.monthlyTransactions}
	yearlyTransactions={data.yearlyTransactions}
	form={data.form}
	loadError={data.loadError}
/>
