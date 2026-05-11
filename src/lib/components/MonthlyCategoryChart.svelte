<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { MonthlySpentChartData } from '$lib';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartTitle: string;
		chartData?: MonthlySpentChartData[];
	}

	let { chartTitle, chartData }: Props = $props();

	const chartConfig = {
		spent: { label: 'Total Spent', color: 'var(--chart-2)' },
		label: { color: 'var(--background)' }
	} satisfies Chart.ChartConfig;

	const averageSpent = $derived.by(() => {
		if (!chartData || chartData.length === 0) return 0;
		const total = chartData.reduce((sum, d) => sum + d.spent, 0);
		return total / chartData.length;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{chartTitle}</Card.Title>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig} class="aspect-auto h-44 w-full">
			<BarChart
				labels={{ offset: 12 }}
				data={chartData}
				x="month"
				y="spent"
				xScale={scaleBand().padding(0.25)}
				axis="x"
				rule={false}
				series={[{ key: 'spent', label: 'Total Spent', color: chartConfig.spent.color }]}
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
					<Chart.Tooltip hideLabel />
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-start gap-2 text-sm">
			<div class="grid gap-2">
				<div class="flex items-center gap-2 leading-none font-medium text-muted-foreground">
					Avg/month: <span class="text-foreground">{formatCurrency(averageSpent)}</span>
				</div>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
