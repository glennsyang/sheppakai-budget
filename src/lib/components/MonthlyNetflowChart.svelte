<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { MonthlyNetflowData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartData: MonthlyNetflowData[];
		chartTitle?: string;
		chartDescription?: string;
	}

	let {
		chartData,
		chartTitle = 'Monthly Surplus / Deficit',
		chartDescription = 'Net cashflow per month (income minus spending)'
	}: Props = $props();

	const chartConfig = {
		surplus: { label: 'Surplus', color: 'var(--chart-2)' },
		deficit: { label: 'Deficit', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	// Split into surplus/deficit series — one is always zero per month, stacked = single bar per month
	let splitData = $derived(
		chartData.map((d) => ({
			month: d.month,
			surplus: d.net >= 0 ? d.net : 0,
			deficit: d.net < 0 ? Math.abs(d.net) : 0
		}))
	);
</script>

<Card.Root class="bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	<Card.Header>
		<Card.Title>{chartTitle}</Card.Title>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content class="px-2 sm:p-6">
		<Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
			<BarChart
				data={splitData}
				x="month"
				xScale={scaleBand().padding(0.25)}
				axis="x"
				series={[
					{ key: 'surplus', label: 'Surplus', color: chartConfig.surplus.color },
					{ key: 'deficit', label: 'Deficit', color: chartConfig.deficit.color }
				]}
				seriesLayout="stack"
				rule={false}
				props={{
					bars: {
						stroke: 'none',
						radius: 4,
						rounded: 'all',
						initialHeight: 0,
						motion: {
							y: { type: 'tween', duration: 500, easing: cubicInOut },
							height: { type: 'tween', duration: 500, easing: cubicInOut }
						}
					},
					highlight: { area: { fill: 'none' } },
					xAxis: {
						format: (d: string) => d.slice(0, 3)
					}
				}}
			>
				{#snippet belowMarks()}
					<Highlight area={{ class: 'fill-muted' }} />
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip class="w-52">
						{#snippet formatter({ name, value })}
							{@const amount = value as number}
							{@const isSurplus = name === 'Surplus'}
							{#if amount > 0}
								<div
									class="size-2.5 shrink-0 rounded-[2px]"
									style="background-color: {isSurplus ? 'var(--chart-2)' : 'var(--chart-1)'}"
								></div>
								{isSurplus ? 'Surplus' : 'Deficit'}
								<div
									class={`ms-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums ${isSurplus ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
								>
									{isSurplus ? '+' : '-'}{formatCurrency(amount)}
								</div>
							{/if}
						{/snippet}
					</Chart.Tooltip>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer class="flex-col items-start gap-1 text-sm">
		<div class="flex gap-4 text-xs text-muted-foreground">
			<div class="flex items-center gap-1.5">
				<div class="size-2.5 rounded-sm bg-[var(--chart-2)]"></div>
				<span>Surplus (income &gt; spending)</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="size-2.5 rounded-sm bg-[var(--chart-1)]"></div>
				<span>Deficit (spending &gt; income)</span>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
