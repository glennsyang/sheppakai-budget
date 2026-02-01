<script lang="ts">
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { MonthlySpentChartData } from '$lib/types';

	interface Props {
		chartTitle: string;
		chartDescription: string;
		chartData?: MonthlySpentChartData[];
	}

	let { chartTitle, chartDescription, chartData }: Props = $props();

	const chartConfig = {
		spent: { label: 'Total Spent', color: 'var(--chart-2)' },
		label: { color: 'var(--background)' }
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{chartTitle}</Card.Title>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig}>
			<BarChart
				labels={{ offset: 12 }}
				data={chartData}
				orientation="horizontal"
				yScale={scaleBand().padding(0.25)}
				y="month"
				axis="y"
				rule={false}
				series={[{ key: 'spent', label: 'Total Spent', color: chartConfig.spent.color }]}
				padding={{ right: 16 }}
				props={{
					bars: {
						stroke: 'none',
						radius: 5,
						rounded: 'all',
						initialWidth: 0,
						initialX: 0,
						motion: {
							x: { type: 'tween', duration: 500, easing: cubicInOut },
							width: { type: 'tween', duration: 500, easing: cubicInOut }
						}
					},
					highlight: { area: { fill: 'none' } },
					yAxis: {
						tickLabelProps: {
							textAnchor: 'start',
							dx: 6,
							class: 'stroke-none fill-background!'
						},
						tickLength: 0
					}
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel />
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-start gap-2 text-sm">
			<div class="grid gap-2">
				<div class="flex items-center gap-2 leading-none font-medium">
					Trending up by ??? this month <TrendingUpIcon class="size-4" />
				</div>
				<div class="flex items-center gap-2 leading-none text-muted-foreground">
					Showing total spend for the last 6 months
				</div>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
