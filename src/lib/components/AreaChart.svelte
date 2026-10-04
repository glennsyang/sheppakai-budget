<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import type { ChartData } from '$lib/types';
	import { formatCurrency, formatCurrencyRounded } from '$lib/utils';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { scaleUtc } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import { Area, AreaChart, LinearGradient } from 'layerchart';

	interface Props {
		categoryName: string;
		chartData: ChartData[];
	}

	type TimeRange = '3m' | '6m' | '12m';

	let { categoryName, chartData }: Props = $props();
	let timeRange = $state<TimeRange>('6m');

	const chartConfig = {
		actual: { label: 'Spent', color: 'var(--foreground)' },
		planned: { label: 'Budgeted', color: 'var(--muted-foreground)' }
	} satisfies Chart.ChartConfig;

	function getTrendToneClass(direction: 'up' | 'down') {
		if (direction === 'up') return 'text-destructive';
		return 'text-positive';
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
				? 'text-positive'
				: 'text-destructive'
	);
</script>

<Card.Root class="gap-4">
	<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="grid gap-1">
			<Card.Title class="text-base tracking-tight">{categoryName} over time</Card.Title>
			<Card.Description>Spent against budgeted, {selectedRangeLabel.toLowerCase()}</Card.Description
			>
		</div>
		<Tabs.Root bind:value={() => timeRange, (v) => (timeRange = v as TimeRange)}>
			<Tabs.List class="h-9" aria-label="Chart range">
				<Tabs.Trigger value="3m" class="px-3">3 mo</Tabs.Trigger>
				<Tabs.Trigger value="6m" class="px-3">6 mo</Tabs.Trigger>
				<Tabs.Trigger value="12m" class="px-3">12 mo</Tabs.Trigger>
			</Tabs.List>
		</Tabs.Root>
	</Card.Header>
	<Card.Content>
		<Chart.Container config={chartConfig} class="aspect-auto h-64 w-full sm:h-72">
			<AreaChart
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
				{#snippet marks()}
					<!-- Spent is ink over a faint ink fade; budgeted is a dashed muted line (Neutral Ink Rule). -->
					<LinearGradient
						stops={[
							'color-mix(in oklch, var(--foreground) 10%, transparent)',
							'color-mix(in oklch, var(--foreground) 0%, transparent)'
						]}
						vertical
					>
						{#snippet children({ gradient })}
							<Area
								seriesKey="actual"
								curve={curveMonotoneX}
								line={{ class: 'stroke-[2px] stroke-foreground' }}
								motion="tween"
								fill={gradient}
							/>
						{/snippet}
					</LinearGradient>
					<Area
						seriesKey="planned"
						curve={curveMonotoneX}
						fill="transparent"
						line={{ class: 'stroke-[1.5px] stroke-muted-foreground/60 [stroke-dasharray:4_4]' }}
						motion="tween"
					/>
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip labelFormatter={(v: Date) => formatMonthLongUtc(v)} indicator="dot" />
				{/snippet}
			</AreaChart>
		</Chart.Container>
		<ul class="text-muted-foreground mt-3 flex items-center justify-center gap-5 text-xs">
			<li class="flex items-center gap-2">
				<span class="bg-foreground h-0.5 w-4 rounded-full" aria-hidden="true"></span>Spent
			</li>
			<li class="flex items-center gap-2">
				<span
					class="border-muted-foreground/70 w-4 border-t-[1.5px] border-dashed"
					aria-hidden="true"
				></span>Budgeted
			</li>
		</ul>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-start gap-2 text-xs">
			<div class="grid gap-1.5">
				{#if trendingData}
					<div
						class={`flex items-center gap-1.5 leading-none font-medium tabular-nums ${getTrendToneClass(trendingData.direction)}`}
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
					<div class="flex items-center gap-1.5 leading-none tabular-nums {avgColorClass}">
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
