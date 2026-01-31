<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight, type ChartContextValue } from 'layerchart';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { cubicInOut } from 'svelte/easing';
	import type { MonthlyInOutData } from '$lib/types';

	interface Props {
		chartTitle: string;
		chartDescription: string;
		chartData?: MonthlyInOutData[];
	}

	let { chartTitle, chartDescription, chartData }: Props = $props();

	const chartConfig = {
		in: { label: 'In', color: 'var(--chart-2)' },
		out: { label: 'Out', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;

	let context = $state<ChartContextValue>();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{chartTitle}</Card.Title>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig}>
			<BarChart
				bind:context
				orientation="horizontal"
				data={chartData}
				yScale={scaleBand().padding(0.25)}
				y="month"
				axis="y"
				series={[
					{ key: 'in', label: 'In', color: chartConfig.in.color },
					{ key: 'out', label: 'Out', color: chartConfig.out.color }
				]}
				padding={{ left: 20 }}
				x1Scale={scaleBand().paddingInner(0.2)}
				seriesLayout="group"
				rule={false}
				props={{
					bars: {
						stroke: 'none',
						radius: 5,
						insets: {
							left: 24
						},
						rounded: 'all',
						initialWidth: 0,
						initialX: 0,
						motion: {
							x: { type: 'tween', duration: 500, easing: cubicInOut },
							width: { type: 'tween', duration: 500, easing: cubicInOut }
						},
						// use the height of the chart to animate the bars
						initialY: context?.height,
						initialHeight: 0
					},
					highlight: { area: { fill: 'none' } },
					yAxis: { format: (d) => d.slice(0, 3) }
				}}
				legend
			>
				{#snippet belowMarks()}
					<Highlight area={{ class: 'fill-muted' }} />
				{/snippet}

				{#snippet tooltip()}
					<Chart.Tooltip indicator="line" />
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
