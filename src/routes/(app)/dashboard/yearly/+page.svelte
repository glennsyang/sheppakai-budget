<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';

	import { goto } from '$app/navigation';
	import MonthlyCategoryChart from '$lib/components/MonthlyCategoryChart.svelte';
	import TimeRangeInOut from '$lib/components/TimeRangeInOut.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { getCategoriesContext } from '$lib/contexts';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const categories = getCategoriesContext();
	function onViewChange(value: string | undefined) {
		if (!value) return;
		goto(`?view=${value}&year=${data.year}`, { keepFocus: true, replaceState: true });
	}

	function onYearChange(value: string | undefined) {
		if (!value) return;
		goto(`?view=${data.view}&year=${value}`, { keepFocus: true, replaceState: true });
	}

	// Sort categories alphabetically
	let sortedCategories = $derived([...categories()].sort((a, b) => a.name.localeCompare(b.name)));
	function getCategoryMonthlyData(categoryId: string) {
		if (!data.timeRangeData || !data.actualExpenses) return [];

		// Create a map to store spending by month
		const monthlySpending = new SvelteMap<string, number>();

		// Initialize all months from timeRangeData with 0
		data.timeRangeData.forEach((item) => {
			monthlySpending.set(item.month, 0);
		});

		// Get month names from timeRangeData to use for filtering transactions
		const monthsInRange = data.timeRangeData.map((item) => item.month);

		// Aggregate spending by month for this category
		data.actualExpenses
			.filter((expense) => expense?.category?.id === categoryId)
			.forEach((expense) => {
				const expenseDate = new Date(expense.date);
				const monthIndex = expenseDate.getMonth();
				const monthName = [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				][monthIndex];

				if (monthsInRange.includes(monthName)) {
					const currentTotal = monthlySpending.get(monthName) || 0;
					monthlySpending.set(monthName, currentTotal + expense.amount);
				}
			});

		// Convert to array format matching MonthlySpentChartData
		return data.timeRangeData.map((item) => ({
			month: item.month,
			spent: monthlySpending.get(item.month) || 0
		}));
	}

	// Generate year options (2025-2026)
	const yearOptions = [
		{ label: '2025', value: '2025' },
		{ label: '2026', value: '2026' }
	];

	let viewLabel = $derived(data.view === 'current' ? 'Last 6 Months' : 'Full Year');
	let timeRangeDescription = $derived(
		data.view === 'current' ? `Last 6 Months of ${data.year}` : `Full Year ${data.year}`
	);
</script>

<svelte:head>
	<title>Yearly Dashboard</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Yearly Dashboard</h1>
				<p class="mt-2 text-muted-foreground">Annual overview of your budget and expenses</p>
			</div>
			<div class="flex gap-4">
				<!-- Year Selector -->
				<div class="w-32">
					<Select.Root type="single" value={data.year?.toString()} onValueChange={onYearChange}>
						<Select.Trigger class="w-full">
							{data.year}
						</Select.Trigger>
						<Select.Content>
							<Select.Label>Select Year</Select.Label>
							{#each yearOptions as yearOption (yearOption.value)}
								<Select.Item value={yearOption.value} label={yearOption.label}>
									{yearOption.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- View Toggle -->
				<Tabs.Root value={data.view} onValueChange={onViewChange} class="w-100">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="current">Last 6 Months</Tabs.Trigger>
						<Tabs.Trigger value="full">Full Year</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>
		</div>
	</div>

	<!-- Time Range Chart -->
	<div class="mt-6">
		<TimeRangeInOut
			chartTitle={viewLabel + ' In & Out'}
			chartDescription={'Overview of ' + timeRangeDescription.toLowerCase()}
			chartData={data.timeRangeData}
		/>
	</div>

	<!-- Category Expenses -->
	<h2 class="mt-8 mb-4 text-xl font-semibold">Spent by Category</h2>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each sortedCategories as category (category.id)}
			<MonthlyCategoryChart
				chartTitle={category?.name}
				chartDescription={'Monthly spending breakdown for ' + category?.name}
				chartData={getCategoryMonthlyData(category.id)}
			/>
		{/each}
	</div>
</div>
