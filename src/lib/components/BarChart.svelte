<script lang="ts">
	import { scaleUtc } from 'd3-scale';
	import { BarChart, type ChartContextValue, Highlight } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { BarChartData } from '$lib/types';

	interface Props {
		chartTitle: string;
		chartDescription: string;
		chartData: BarChartData[];
	}

	let { chartTitle, chartDescription, chartData }: Props = $props();

	const chartConfig = {
		views: { label: 'Total Spent: ', color: '' },
		spent: { label: 'Spent', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
	let context = $state<ChartContextValue>();

	let activeChart = $state<keyof typeof chartConfig>('spent');

	const activeSeries = $derived([
		{
			key: activeChart,
			label: chartConfig[activeChart].label,
			color: chartConfig[activeChart].color
		}
	]);
</script>

<Card.Root class="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	<Card.Header>
		<Card.Title>{chartTitle}</Card.Title>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content class="px-2 sm:p-6">
		<Chart.Container config={chartConfig} class="aspect-auto h-62.5 w-full">
			<BarChart
				bind:context
				data={chartData}
				x="date"
				axis="x"
				series={activeSeries}
				props={{
					bars: {
						stroke: 'none',
						rounded: 'none',
						// use the height of the chart to animate the bars
						initialY: context?.height,
						initialHeight: 0,
						motion: {
							y: { type: 'tween', duration: 500, easing: cubicInOut },
							height: { type: 'tween', duration: 500, easing: cubicInOut }
						}
					},
					highlight: { area: { fill: 'none' } },
					xAxis: {
						format: (d: Date) => {
							return d.toLocaleDateString('en-US', {
								month: 'short',
								day: '2-digit'
							});
						},
						ticks: (scale) => scaleUtc(scale.domain(), scale.range()).ticks()
					}
				}}
			>
				{#snippet belowMarks()}
					<Highlight area={{ class: 'fill-muted' }} />
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip
						nameKey="views"
						labelFormatter={(v: Date) => {
							return v.toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								year: 'numeric'
							});
						}}
					/>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
