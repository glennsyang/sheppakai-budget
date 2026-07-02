<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { ChartData } from '$lib/types';
	import { formatCurrency, formatCurrencyRounded } from '$lib/utils';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { Area, AreaChart, LinearGradient } from 'layerchart';

	interface Props {
		categoryName: string;
		chartData: ChartData[];
	}

	type TimeRange = '3m' | '6m' | '12m';

	let { categoryName, chartData }: Props = $props();
	let timeRange = $state<TimeRange>('6m');

	const chartConfig = {
		actual: { label: 'Actual', color: 'var(--chart-1)' },
		planned: { label: 'Planned', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	function getTrendToneClass(direction: 'up' | 'down') {
		if (direction === 'up') return 'text-destructive';
		return 'text-green-600 dark:text-green-400';
	}

	function getMonthsToShow(range: TimeRange) {
		if (range === '3m') return 3;
		if (range === '12m') return 12;
		return 6;
	}

	function getRangeLabel(range: TimeRange) {
		if (range === '3m') return 'Last 3 months';
		if (range === '12m') return 'Last 12 months';
		return 'Last 6 months';
	}

	function formatMonthShortUtc(date: Date) {
		return date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
	}

	function formatMonthLongUtc(date: Date) {
		return date.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}

	const selectedRangeLabel = $derived(getRangeLabel(timeRange));
	const filteredChartData = $derived(chartData.slice(-getMonthsToShow(timeRange)));
	const trendingData = $derived.by(() => {
		if (filteredChartData.length < 2) return null;

		const lastMonth = filteredChartData[filteredChartData.length - 1].actual;
		const previousMonth = filteredChartData[filteredChartData.length - 2].actual;

		if (previousMonth === 0) return null;

		const percentChange = ((lastMonth - previousMonth) / previousMonth) * 100;
		return {
			value: Math.abs(percentChange),
			direction: percentChange >= 0 ? ('up' as const) : ('down' as const)
		};
	});
	const monthRange = $derived.by(() => {
		if (filteredChartData.length === 0) return '';

		const firstMonth = formatMonthLongUtc(filteredChartData[0].date);
		const lastMonth = formatMonthLongUtc(filteredChartData[filteredChartData.length - 1].date);

		return `${firstMonth} - ${lastMonth}`;
	});
	const completedMonths = $derived(filteredChartData.slice(0, -1).filter((d) => d.actual > 0));
	const avgSpend = $derived(
		completedMonths.length > 0
			? completedMonths.reduce((sum, d) => sum + d.actual, 0) / completedMonths.length
			: null
	);
	const currentPlanned = $derived(filteredChartData.at(-1)?.planned ?? 0);
	const avgColorClass = $derived(
		avgSpend === null || currentPlanned === 0
			? 'text-muted-foreground'
			: avgSpend < currentPlanned
				? 'text-green-600 dark:text-green-400'
				: 'text-destructive'
	);
</script>

<Card.Root>
	<Card.Header
		class="flex flex-col gap-3 border-b py-5 sm:flex-row sm:items-start sm:justify-between"
	>
		<div class="grid gap-1">
			<Card.Title>Spending history for {categoryName}</Card.Title>
			<Card.Description>
				Showing <i>planned</i> and <i>actual</i> for {selectedRangeLabel.toLowerCase()}
			</Card.Description>
		</div>
		<Select.Root type="single" bind:value={timeRange}>
			<Select.Trigger class="w-40 rounded-lg" aria-label="Select chart range">
				{selectedRangeLabel}
			</Select.Trigger>
			<Select.Content class="rounded-xl">
				<Select.Item value="3m" class="rounded-lg">Last 3 months</Select.Item>
				<Select.Item value="6m" class="rounded-lg">Last 6 months</Select.Item>
				<Select.Item value="12m" class="rounded-lg">Last 12 months</Select.Item>
			</Select.Content>
		</Select.Root>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig}>
			<AreaChart
				legend
				data={filteredChartData}
				x="date"
				xScale={scaleUtc()}
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
					xAxis: {
						ticks: timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12,
						format: (v: Date) => formatMonthShortUtc(v)
					},
					yAxis: {
						format: (v: number) => formatCurrencyRounded(v)
					}
				}}
			>
				{#snippet marks({ context })}
					{#each context.series.visibleSeries as s (s.key)}
						<LinearGradient
							stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
							vertical
						>
							{#snippet children({ gradient })}
								<Area
									seriesKey={s.key}
									curve={curveNatural}
									fillOpacity={0.4}
									line={{ class: 'stroke-1' }}
									motion="tween"
									{...s.props}
									fill={gradient}
								/>
							{/snippet}
						</LinearGradient>
					{/each}
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip labelFormatter={(v: Date) => formatMonthLongUtc(v)} indicator="dot" />
				{/snippet}
			</AreaChart>
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
						{selectedRangeLabel} avg spend: {formatCurrency(avgSpend)}
						<InfoTooltip
							size="sm"
							text="Average actual spend across completed months with transactions in the selected range, excluding the current (partial) month."
						/>
					</div>
				{/if}
			</div>
		</div>
	</Card.Footer>
</Card.Root>
