<script lang="ts">
	import ReceiptsPage from '$lib/components/ReceiptsPage.svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();
</script>

<ReceiptsPage
	title="Business receipts"
	subtitle="Business expenses and the GST on them, for the books"
	basePath="/receipts/business"
	{columns}
	amountLabel="Spent"
	addLabel="Add business receipt"
	monthlyTransactions={data.monthlyTransactions}
	yearlyTransactions={data.yearlyTransactions}
	form={data.form}
	loadError={data.loadError}
/>
