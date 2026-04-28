<script lang="ts">
	import { setContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Card, CardContent } from '$lib/components/ui/card';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import YearSwitcher from '$lib/components/YearSwitcher.svelte';
	import type { windowCleaningJobSchema } from '$lib/formSchemas/windowCleaning';

	import { columns } from './columns';

	import type { WindowCleaningJob } from '$lib';

	interface Props {
		data: {
			jobs: WindowCleaningJob[];
			totalCharged: number;
			totalTips: number;
			totalEarned: number;
			earnedLastYear: number;
			jobCount: number;
			jobForm: SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
		};
	}

	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	setContext('jobForm', data.jobForm);

	const currentDate = new Date();
	const defaultYear = currentDate.getFullYear();

	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onYearChange(year: number) {
		goto(`/window-cleaning/jobs?year=${year}`, {
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

	<!-- Year Selector -->
	<div class="mb-4">
		<YearSwitcher currentYear={selectedYear} {onYearChange} />
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
				{#if data.earnedLastYear > 0}
					{@const diff = data.totalEarned - data.earnedLastYear}
					{@const pct = Math.round(Math.abs(diff / data.earnedLastYear) * 100)}
					<p
						class="mt-1 text-xs {diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}"
					>
						{diff >= 0 ? '▲' : '▼'}
						{pct}% vs {selectedYear - 1} ({currencyFormatter.format(data.earnedLastYear)})
					</p>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Jobs Table -->
	{#if data.jobs.length > 0}
		<DataTable {columns} data={data.jobs} />
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">No jobs found for this year.</p>
			</CardContent>
		</Card>
	{/if}
</div>
