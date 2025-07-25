<script lang="ts">
	import { DataTable } from '$lib';
	import { onMount } from 'svelte';
	import type { Income } from '$lib';

	let income = $state<Income[]>([]);
	let loading = $state<boolean>(true);

	// Column definitions for income table
	const incomeColumns = [
		{ key: 'date', label: 'Date', width: '100px' },
		{
			key: 'user',
			label: 'Entered By',
			format: (user: any) => user?.firstName || 'Unknown User'
		},
		{ key: 'description', label: 'Description' },
		{
			key: 'amount',
			label: 'Amount',
			align: 'right' as const,
			format: (amount: number) => `$${amount.toFixed(2)}`
		}
	];

	async function fetchIncome() {
		loading = true;
		try {
			const res = await fetch('/api/income');
			if (res.ok) {
				const data = await res.json();
				income = data.income || [];
			}
		} catch (error) {
			console.error('Error fetching income:', error);
			income = [];
		} finally {
			loading = false;
		}
	}

	onMount(fetchIncome);
</script>

<svelte:head>
	<title>All Income - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">All Income</h1>
		<p class="mt-2 text-muted-foreground">Complete list of all your recorded income</p>
	</div>

	<!-- All Income Table -->
	<DataTable
		data={income}
		columns={incomeColumns}
		{loading}
		title="Income"
		caption="Complete list of all your income."
		emptyMessage="No income recorded yet."
		actionButton={{
			label: 'Back to Dashboard',
			href: '/dashboard'
		}}
	/>
</div>
