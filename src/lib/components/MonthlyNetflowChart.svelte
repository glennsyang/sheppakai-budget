<script lang="ts">
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { MonthlyNetflowData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight } from 'layerchart';

	interface Props {
		chartData: MonthlyNetflowData[];
	}

	let { chartData }: Props = $props();

	const chartConfig = {
		net: { label: 'Net' }
	} satisfies Chart.ChartConfig;

	// Money means money: surplus months in positive green, deficit months in destructive red.
	const fillFor = (net: number) =>
		net > 0 ? 'var(--positive)' : net < 0 ? 'var(--destructive)' : 'var(--muted-foreground)';
</script>

<Chart.Container config={chartConfig} class="aspect-auto h-48 w-full">
	<BarChart
		data={chartData}
		xScale={scaleBand().padding(0.35)}
		x="month"
		y="net"
		yNice={4}
		yBaseline={0}
		c={(d) => fillFor(d.net)}
		cRange={['var(--positive)', 'var(--destructive)', 'var(--muted-foreground)']}
		axis="x"
		rule
		props={{
			bars: { stroke: 'none', radius: 3, fillOpacity: 0.85 },
			highlight: { area: { fill: 'none' } },
			xAxis: {
				format: (d: string) => d.slice(0, 3),
				tickLabelProps: { class: 'fill-muted-foreground text-[0.6875rem]' }
			},
			rule: { class: 'stroke-border' }
		}}
	>
		{#snippet belowMarks()}
			<Highlight area={{ class: 'fill-muted' }} />
		{/snippet}
		{#snippet tooltip()}
			<Chart.Tooltip class="w-48">
				{#snippet formatter({ value })}
					{@const amount = value as number}
					<div
						class="size-2 shrink-0 rounded-full"
						style="background-color: {fillFor(amount)}"
					></div>
					{amount > 0 ? 'Surplus' : amount < 0 ? 'Deficit' : 'Break-even'}
					<div
						class={[
							'ms-auto font-medium tabular-nums',
							amount > 0
								? 'text-positive'
								: amount < 0
									? 'text-destructive'
									: 'text-muted-foreground'
						]}
					>
						{amount > 0 ? '+' : ''}{formatCurrency(amount)}
					</div>
				{/snippet}
			</Chart.Tooltip>
		{/snippet}
	</BarChart>
</Chart.Container>
