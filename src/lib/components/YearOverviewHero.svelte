<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import MonthlyNetflowChart from '$lib/components/MonthlyNetflowChart.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { MonthlyNetflowData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { getYearProgress } from '$lib/utils/dates';

	interface Props {
		year: number;
		totalIncome: number;
		totalSpent: number;
		netflowData: MonthlyNetflowData[];
		/** e.g. "May - Oct 2026" */
		rangeLabel: string;
		showChart?: boolean;
	}

	let {
		year,
		totalIncome,
		totalSpent,
		netflowData,
		rangeLabel,
		showChart = true
	}: Props = $props();

	let progress = $derived(getYearProgress(year));
	let net = $derived(totalIncome - totalSpent);
	let surplusMonths = $derived(netflowData.filter((d) => d.net > 0).length);
</script>

<Card.Root class="gap-0 overflow-hidden py-0">
	<div class={['grid', showChart && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]']}>
		<div class="flex flex-col justify-center p-5 sm:p-6 lg:p-8">
			{#if progress.status === 'future'}
				<h2 class="text-muted-foreground text-sm">{year}</h2>
				<p class="mt-2 text-2xl font-semibold tracking-tight">{year} hasn't started.</p>
			{:else}
				<div class="text-muted-foreground flex items-center gap-1 text-sm">
					<h2>{progress.status === 'past' ? `${year} finished` : `${year} so far`}</h2>
					<InfoTooltip
						size="sm"
						text="Year-to-date income minus all spending, recurring included. Excluded categories are not counted."
					/>
				</div>
				<p
					class={[
						'mt-2 text-[2.75rem] leading-none font-semibold tracking-[-0.035em] tabular-nums sm:text-[3.5rem]',
						net < 0 && 'text-destructive'
					]}
				>
					{net < 0 ? '−' : '+'}{formatCurrency(Math.abs(net))}
				</p>
				<p class="mt-3 text-sm">
					<span class={['font-medium', net < 0 ? 'text-destructive' : 'text-positive']}
						>{net < 0 ? 'Net deficit' : 'Net saved'}</span
					>
					<span class="text-muted-foreground tabular-nums"
						>from {formatCurrency(totalIncome)} in and {formatCurrency(totalSpent)} out.</span
					>
				</p>
			{/if}
		</div>

		{#if showChart}
			<div class="bg-muted/40 flex flex-col gap-3 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l">
				<div
					class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
				>
					<p class="text-sm font-medium">Surplus by month</p>
					<p class="text-muted-foreground text-xs tabular-nums">
						{rangeLabel}{#if netflowData.length > 0}
							&nbsp;· {surplusMonths} of {netflowData.length} months ahead{/if}
					</p>
				</div>
				{#if netflowData.length > 0}
					<MonthlyNetflowChart chartData={netflowData} />
				{:else}
					<p class="text-muted-foreground bg-muted/50 rounded-lg px-4 py-8 text-center text-sm">
						No months to show yet.
					</p>
				{/if}
			</div>
		{/if}
	</div>
</Card.Root>
