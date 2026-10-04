<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import PeriodPicker from '$lib/components/PeriodPicker.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { jobFormContext } from '$lib/contexts';
	import { formatDayHeading, getCurrentPacificMonthYear, parseYearParam } from '$lib/utils/dates';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	jobFormContext.set(data.jobForm);

	const { year: defaultYear } = getCurrentPacificMonthYear();

	let selectedYear = $derived(parseYearParam(page.url.searchParams.get('year'), defaultYear));

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

	// A year switch is a same-route navigation: keep the heading and switcher
	// live, and skeleton only the stats and table.
	const reloading = usePendingReload();

	let stats = $derived.by<Stat[]>(() => {
		const diff = data.totalEarned - data.earnedLastYear;
		const pct =
			data.earnedLastYear > 0 ? Math.round(Math.abs(diff / data.earnedLastYear) * 100) : 0;
		return [
			{ label: 'Jobs', value: String(data.jobCount) },
			{ label: 'Charged', value: currencyFormatter.format(data.totalCharged) },
			{ label: 'Tips', value: currencyFormatter.format(data.totalTips) },
			{
				label: 'Total earned',
				value: currencyFormatter.format(data.totalEarned),
				trend:
					data.earnedLastYear > 0
						? {
								direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
								label: `${pct}% ${diff >= 0 ? 'ahead of' : 'behind'} ${selectedYear - 1} (${currencyFormatter.format(data.earnedLastYear)})`
							}
						: undefined
			}
		];
	});
</script>

<svelte:head>
	<title>All jobs · Window cleaning</title>
</svelte:head>

<PageShell
	title="All jobs"
	subtitle="Every window-cleaning visit in {selectedYear}, across all customers"
>
	{#snippet actions()}
		<PeriodPicker mode="year" year={selectedYear} onChange={onYearChange} />
	{/snippet}

	{#if reloading.current}
		<CardGridSkeleton cards={1} linesPerCard={1} lineClass="h-12" label="Loading job totals" />
		<TableSkeleton rows={8} columns={columns.length - 2} />
	{:else if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		<DashboardStatStrip {stats} />
		<DataTable
			{columns}
			data={data.jobs}
			defaultPageSize={20}
			searchPlaceholder="Search customers or notes…"
			mobileGroupBy={(j) => formatDayHeading(j.jobDate)}
			emptyMessage={`No jobs logged in ${selectedYear}.`}
		/>
	{/if}
</PageShell>
