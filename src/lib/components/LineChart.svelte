<script lang="ts">
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { LineChart } from 'layerchart';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { ChartData } from '$lib/types';

	interface Props {
		categoryName: string;
		chartData: ChartData[];
		trendingData?: { value: number; direction: 'up' | 'down' } | null;
		monthRange?: string;
	}

	let { categoryName, chartData, trendingData, monthRange }: Props = $props();

	const chartConfig = {
		actual: { label: 'Actual', color: 'var(--chart-1)' },
		planned: { label: 'Planned', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Spending history for {categoryName}</Card.Title>
		<Card.Description
			>Showing <i>planned</i> and <i>actual</i> for the last 6 months</Card.Description
		>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig}>
			<LineChart
				points={{ r: 4 }}
				data={chartData}
				x="date"
				xScale={scaleUtc()}
				axis="x"
				series={[
					{
						key: 'actual',
						label: chartConfig.actual.label,
						color: chartConfig.actual.color
					},
					{
						key: 'planned',
						label: chartConfig.planned.label,
						color: chartConfig.planned.color
					}
				]}
				props={{
					spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
					xAxis: {
						format: (v: Date) => {
							return new Date(v).toLocaleDateString('en-US', {
								month: 'short',
								timeZone: 'UTC' // Force UTC interpretation
							});
						}
					},
					highlight: { points: { r: 4 } }
				}}
			>
				{#snippet tooltip()}
					<Chart.Tooltip hideLabel />
				{/snippet}
			</LineChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer>
		<div class="mt-4 flex w-full items-start gap-2 text-sm">
			<div class="grid gap-2">
				{#if trendingData}
					<div class="flex items-center gap-2 leading-none font-medium">
						Trending {trendingData.direction} by {trendingData.value.toFixed(1)}% this month
						{#if trendingData.direction === 'up'}
							<TrendingUpIcon class="size-4" />
						{:else}
							<TrendingDownIcon class="size-4" />
						{/if}
					</div>
				{/if}
				{#if monthRange}
					<div class="flex items-center gap-2 leading-none text-muted-foreground">
						{monthRange}
					</div>
				{/if}
			</div>
		</div>
	</Card.Footer>
</Card.Root>
