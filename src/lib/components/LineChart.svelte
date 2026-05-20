<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { ChartData } from '$lib/types';
	import { formatCurrency } from '$lib/utils.js';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { LineChart } from 'layerchart';

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

	function getTrendToneClass(direction: 'up' | 'down') {
		if (direction === 'up') return 'text-destructive';
		return 'text-green-600 dark:text-green-400';
	}

	const completedMonths = $derived(chartData.slice(0, -1).filter((d) => d.actual > 0));
	const avgSpend = $derived(
		completedMonths.length > 0
			? completedMonths.reduce((sum, d) => sum + d.actual, 0) / completedMonths.length
			: null
	);
	const currentPlanned = $derived(chartData.at(-1)?.planned ?? 0);
	const avgColorClass = $derived(
		avgSpend === null || currentPlanned === 0
			? 'text-muted-foreground'
			: avgSpend < currentPlanned
				? 'text-green-600 dark:text-green-400'
				: 'text-destructive'
	);
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
						format: (v: Date) =>
							v.toLocaleDateString('en-US', { month: 'short', timeZone: 'America/Los_Angeles' })
					},
					highlight: { points: { r: 6 } }
				}}
				legend
			>
				{#snippet tooltip()}
					<Chart.Tooltip
						labelFormatter={(v: Date) => {
							return v.toLocaleDateString('en-US', {
								month: 'long',
								year: 'numeric',
								timeZone: 'America/Los_Angeles'
							});
						}}
						indicator="line"
					/>
				{/snippet}
			</LineChart>
		</Chart.Container>
	</Card.Content>
	<Card.Footer>
		<div class="mt-4 flex w-full items-start gap-2 text-sm">
			<div class="grid gap-2">
				{#if trendingData}
					<div
						class={`flex items-center gap-2 leading-none font-medium ${getTrendToneClass(trendingData.direction)}`}
					>
						{trendingData.direction[0].toUpperCase() + trendingData.direction.slice(1)} by {trendingData.value.toFixed(
							1
						)}% this month (vs last month)
						{#if trendingData.direction === 'up'}
							<TrendingUpIcon class="size-4" />
						{:else}
							<TrendingDownIcon class="size-4" />
						{/if}
					</div>
				{/if}
				{#if monthRange}
					<div class="text-muted-foreground flex items-center gap-2 leading-none">
						{monthRange}
					</div>
				{/if}
				{#if avgSpend !== null}
					<div class="flex items-center gap-1.5 leading-none {avgColorClass}">
						Last 6 months avg spend: {formatCurrency(avgSpend)}
						<InfoTooltip
							size="sm"
							text="Average actual spend across completed months with transactions, excluding the current (partial) month."
						/>
					</div>
				{/if}
			</div>
		</div>
	</Card.Footer>
</Card.Root>
