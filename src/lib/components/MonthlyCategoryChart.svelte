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
		chartDescription?: string;
		chartData?: MonthlySpentChartData[];
	}

	let { chartTitle, chartDescription, chartData }: Props = $props();

	const chartConfig = {
		budget: { label: 'Budget', color: 'var(--chart-2)' },
		overbudget: { label: 'Over', color: 'var(--chart-1)' }
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
		<Card.Description>{chartDescription ?? 'Monthly spending vs budget'}</Card.Description>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig} class="aspect-auto h-44 w-full">
			<BarChart
				data={chartData}
				xScale={scaleBand().padding(0.25)}
				x="month"
				axis="x"
				rule={false}
				series={[
					{
						key: 'budget',
						label: 'Budget',
						color: chartConfig.budget.color,
						props: { rounded: 'bottom' }
					},
					{
						key: 'overbudget',
						label: 'Over',
						color: chartConfig.overbudget.color
					}
				]}
				seriesLayout="stack"
				props={{
					bars: {
						stroke: 'none',
						initialWidth: 0,
						motion: { type: 'tween', duration: 500, easing: cubicInOut }
					},
					highlight: { area: false },
					xAxis: { format: (d) => d.slice(0, 3) }
				}}
				legend
			>
				{#snippet belowMarks()}
					<Highlight area={{ class: 'fill-muted' }} />
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip />
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
