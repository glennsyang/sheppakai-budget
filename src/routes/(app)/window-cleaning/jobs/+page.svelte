<script lang="ts">
	import { setContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { windowCleaningJobSchema } from '$lib/formSchemas/windowCleaning';

	import { columns } from './columns';

	import type { WindowCleaningJob } from '$lib';

	interface Props {
		data: {
			jobs: WindowCleaningJob[];
			totalCharged: number;
			totalTips: number;
			totalEarned: number;
			jobCount: number;
			jobForm: SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
		};
	}

	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	setContext('jobForm', data.jobForm);

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`/window-cleaning/jobs?month=${month}&year=${year}`, {
			keepFocus: true,
			replaceState: true
		});
	}

	const currencyFormatter = new Intl.NumberFormat('en-CA', {
		style: 'currency',
		currency: 'CAD'
	});
</script>

<svelte:head>
	<title>Window Cleaning — All Jobs</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header -->
	<div class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">All Jobs</h1>
		<p class="mt-1 text-muted-foreground">Complete job history across all customers</p>
	</div>

	<!-- Month Selector -->
	<div class="mb-4">
		<MonthYearSwitcher
			currentMonth={selectedMonth}
			currentYear={selectedYear}
			onMonthChange={onMonthYearChange}
		/>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Jobs</p>
				<p class="text-2xl font-bold">{data.jobCount}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Charged</p>
				<p class="text-2xl font-bold">{currencyFormatter.format(data.totalCharged)}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Tips</p>
				<p class="text-2xl font-bold">{currencyFormatter.format(data.totalTips)}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Total Earned</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">
					{currencyFormatter.format(data.totalEarned)}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Jobs Table -->
	{#if data.jobs.length > 0}
		<DataTable {columns} data={data.jobs} />
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">No jobs found for this month.</p>
			</CardContent>
		</Card>
	{/if}
</div>
