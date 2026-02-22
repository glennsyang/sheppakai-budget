<script lang="ts">
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleBand } from 'd3-scale';
	import { BarChart } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { MonthlyCategoryTrendData, MonthlySpentChartData } from '$lib/types';

	interface Props {
		chartTitle: string;
		chartDescription: string;
		chartData?: MonthlySpentChartData[];
		trendData?: MonthlyCategoryTrendData | null;
		footerRangeText?: string;
	}

	let { chartTitle, chartDescription, chartData, trendData, footerRangeText }: Props = $props();

	const chartConfig = {
		spent: { label: 'Total Spent', color: 'var(--chart-2)' },
		label: { color: 'var(--background)' }
	} satisfies Chart.ChartConfig;

	function getTrendToneClass(direction: MonthlyCategoryTrendData['direction']) {
		if (direction === 'up') return 'text-destructive';
		if (direction === 'down') return 'text-green-600 dark:text-green-400';
		return '';
	}

	function getTrendBorderClass(direction: MonthlyCategoryTrendData['direction']) {
		if (direction === 'up') return 'border-destructive/40';
		if (direction === 'down') return 'border-green-600/40 dark:border-green-400/40';
		return '';
	}
</script>

<Card.Root class={trendData ? getTrendBorderClass(trendData.direction) : ''}>
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
				{#if trendData}
					<div
						class={`flex items-center gap-2 leading-none font-medium ${getTrendToneClass(trendData.direction)}`}
					>
						{#if trendData.direction === 'up' && trendData.value !== null}
							Trending up by {trendData.value.toFixed(1)}% this month
							<TrendingUpIcon class="size-4" />
						{:else if trendData.direction === 'down' && trendData.value !== null}
							Trending down by {trendData.value.toFixed(1)}% this month
							<TrendingDownIcon class="size-4" />
						{:else if trendData.direction === 'new'}
							New spending this month
							<TrendingUpIcon class="size-4" />
						{:else}
							No change this month
						{/if}
					</div>
				{/if}
				<div class="flex items-center gap-2 leading-none text-muted-foreground">
					{footerRangeText ?? 'Total spend for the last 6 months'}
				</div>
			</div>
		</div>
	</Card.Footer>
</Card.Root>
