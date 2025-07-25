<script lang="ts">
	import { DataTable } from '$lib';
	import { onMount } from 'svelte';
	import type { Expense } from '$lib';

	let expenses = $state<Expense[]>([]);
	let loading = $state<boolean>(true);

	// Column definitions for expenses table
	const expenseColumns = [
		{ key: 'date', label: 'Date', width: '100px' },
		{
			key: 'user',
			label: 'Entered By',
			format: (user: any) => user?.firstName || 'Unknown User'
		},
		{
			key: 'category',
			label: 'Category',
			format: (category: any) => category?.name || 'Uncategorized'
		},
		{ key: 'description', label: 'Description' },
		{
			key: 'amount',
			label: 'Amount',
			align: 'right' as const,
			format: (amount: number) => `$${amount.toFixed(2)}`
		}
	];

	async function fetchExpenses() {
		loading = true;
		try {
			const res = await fetch('/api/expenses');
			if (res.ok) {
				const data = await res.json();
				expenses = data.expenses || [];
			}
		} catch (error) {
			console.error('Error fetching expenses:', error);
			expenses = [];
		} finally {
			loading = false;
		}
	}

	onMount(fetchExpenses);
</script>

<svelte:head>
	<title>All Expenses - Budget Tracker</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">All Expenses</h1>
		<p class="mt-2 text-muted-foreground">Complete list of all your recorded expenses</p>
	</div>

	<!-- All Expenses Table -->
	<DataTable
		data={expenses}
		columns={expenseColumns}
		{loading}
		title="Expenses"
		caption="Complete list of all your expenses."
		emptyMessage="No expenses recorded yet."
		actionButton={{
			label: 'Back to Dashboard',
			href: '/dashboard'
		}}
	/>
</div>
