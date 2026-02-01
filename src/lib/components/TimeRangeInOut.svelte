<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { BarChart, type ChartContextValue, Highlight } from 'layerchart';
	import { cubicInOut } from 'svelte/easing';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { TimeRangeInOutData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartTitle: string;
		chartDescription: string;
		chartData?: TimeRangeInOutData[];
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
					<Chart.Tooltip hideLabel class="w-45">
						{#snippet formatter({ name, index, value, item })}
							<div
								style="--color-bg: var(--color-{name.toLowerCase()})"
								class="size-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
							></div>
							{chartConfig[name as keyof typeof chartConfig]?.label || name}
							<div
								class="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"
							>
								{formatCurrency(value as number)}
							</div>
							<!-- Add this after the last item-->
							{#if index === 1}
								<div
									class="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground"
								>
									Remaining
									<div
										class="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"
									>
										{formatCurrency(item.payload.in - item.payload.out)}
									</div>
								</div>
							{/if}
						{/snippet}
					</Chart.Tooltip>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
