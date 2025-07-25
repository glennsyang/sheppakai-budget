<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { DataTable } from '$lib';
	import { onMount, onDestroy } from 'svelte';
	import type { Expense, Income } from '$lib';

	let expenses = $state<Expense[]>([]);
	let income = $state<Income[]>([]);
	let totalExpenses = $state<number>(0);
	let totalIncome = $state<number>(0);
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

	async function fetchDashboardData() {
		loading = true;
		try {
			const res = await fetch('/api/summary');
			if (res.ok) {
				const apiData = await res.json();
				expenses = apiData.expenses;
				income = apiData.income;
				totalExpenses = apiData.totalExpenses;
				totalIncome = apiData.totalIncome;
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			// Use placeholder data on error
			expenses = [];
			income = [];
			totalExpenses = 0;
			totalIncome = 0;
		} finally {
			loading = false;
		}
	}

	// Make fetchDashboardData available globally so dialogs can call it
	if (typeof window !== 'undefined') {
		(window as any).refreshDashboard = fetchDashboardData;

		// Listen for custom events to refresh data
		window.addEventListener('expense-added', fetchDashboardData);
		window.addEventListener('income-added', fetchDashboardData);
	}

	onMount(fetchDashboardData);

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('expense-added', fetchDashboardData);
			window.removeEventListener('income-added', fetchDashboardData);
		}
	});
</script>

<svelte:head>
	<title>Dashboard - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="mt-2 text-muted-foreground">Overview of your budget and expenses</p>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="overflow-hidden rounded-lg border bg-card shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium">Income</h2>
				{#if loading}
					<Skeleton class="mb-2 h-2 w-full" />
					<Skeleton class="h-4 w-20" />
				{:else}
					<Progress value={totalIncome - totalExpenses} max={totalIncome} class="mb-2" />
					<p class="text-sm text-muted-foreground">${totalIncome.toFixed(2)}</p>
				{/if}
			</div>
		</div>

		<div class="overflow-hidden rounded-lg border bg-card shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium">Expenses</h2>
				{#if loading}
					<Skeleton class="mb-2 h-2 w-full" />
					<Skeleton class="h-4 w-20" />
				{:else}
					<Progress value={totalExpenses} max={totalIncome + totalExpenses} class="mb-2" />
					<p class="text-sm text-muted-foreground">${totalExpenses.toFixed(2)}</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Recent Expenses Table -->
	<DataTable
		data={expenses}
		columns={expenseColumns}
		{loading}
		title="Recent Expenses"
		caption="A list of your recent expenses."
		emptyMessage="No expenses recorded yet."
		actionButton={{
			label: 'View Expenses',
			href: '/expenses'
		}}
	/>

	<!-- Recent Income Table -->
	<DataTable
		data={income}
		columns={incomeColumns}
		{loading}
		title="Recent Income"
		caption="A list of your recent income."
		emptyMessage="No income recorded yet."
		actionButton={{
			label: 'View Income',
			href: '/income'
		}}
	/>
</div>
