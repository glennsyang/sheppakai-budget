<script lang="ts">
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import PeriodPicker from '$lib/components/PeriodPicker.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		selectedMonth: number;
		selectedYear: number;
		onMonthYearChange: (month: number, year: number) => void;
		/** The page's one primary action, beside the period picker. */
		primaryAction?: Snippet;
		/** The page's answer figures, shown as one stat strip above the ledger. */
		stats?: Stat[];
		tableContent: Snippet;
		/** A side panel beside the ledger from `2xl`, below it on smaller screens. */
		summaryContent?: Snippet;
		/** Hide the stats and side panel, e.g. while showing search results. */
		showSummary?: boolean;
		skeletonRows?: number;
		skeletonColumns?: number;
		// When set, the load failed: show the error instead of an empty table and
		// zeroed summary totals.
		loadError?: string;
	}

	let {
		title,
		subtitle,
		selectedMonth,
		selectedYear,
		onMonthYearChange,
		primaryAction,
		stats,
		tableContent,
		summaryContent,
		showSummary = true,
		skeletonRows = 8,
		skeletonColumns = 5,
		loadError
	}: Props = $props();

	// A month/year switch is a same-route navigation: keep the frame and the
	// controls interactive, and skeleton only the regions fed by `data`.
	const reloading = usePendingReload();

	let withAside = $derived(showSummary && !!summaryContent && !loadError);
</script>

<PageShell {title} {subtitle}>
	{#snippet actions()}
		<PeriodPicker month={selectedMonth} year={selectedYear} onChange={onMonthYearChange} />
		{#if primaryAction}
			{@render primaryAction()}
		{/if}
	{/snippet}

	{#if reloading.current}
		{#if showSummary && stats}
			<CardGridSkeleton cards={1} linesPerCard={1} lineClass="h-12" label="Loading totals" />
		{/if}
		<TableSkeleton rows={skeletonRows} columns={skeletonColumns} />
	{:else if loadError}
		<LoadErrorBanner message={loadError} />
	{:else}
		{#if showSummary && stats?.length}
			<DashboardStatStrip {stats} />
		{/if}
		<div
			class={[
				'grid items-start gap-4',
				withAside && '2xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]'
			]}
		>
			<div class="min-w-0">{@render tableContent()}</div>
			{#if withAside}
				{@render summaryContent?.()}
			{/if}
		</div>
	{/if}
</PageShell>
