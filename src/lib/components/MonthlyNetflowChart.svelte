<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { BarChart, Highlight } from 'layerchart';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import type { MonthlyNetflowData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartData: MonthlyNetflowData[];
		chartTitle?: string;
		chartDescription?: string;
	}

	let {
		chartData,
		chartTitle = 'Monthly Surplus / Deficit',
		chartDescription = 'Net cashflow per month (income minus spending)'
	}: Props = $props();

	const chartConfig = {
		net: { label: 'Net Cashflow' }
	} satisfies Chart.ChartConfig;
</script>

<Card.Root class="bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	<Card.Header>
		<div class="flex items-center gap-1.5">
			<Card.Title>{chartTitle}</Card.Title>
			<InfoTooltip
				text="Each bar shows whether you ended the month with a surplus (income exceeded spending) or a deficit (spending exceeded income). Green bars are months you came out ahead; red bars are months you overspent."
			/>
		</div>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content class="px-2 sm:p-6">
		<Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
			<BarChart
				labels={{
					offset: 5,
					value: (d) => d.month,
					fill: (d) => {
						if (d.net > 0) {
							return 'var(--chart-2)';
						} else if (d.net < 0) {
							return 'var(--chart-1)';
						}
					}
				}}
				data={chartData}
				xScale={scaleBand().padding(0.25)}
				x="month"
				y="net"
				yNice={4}
				yBaseline={0}
				cRange={['var(--chart-2)', 'var(--chart-1)']}
				c={(d) => (d.net > 0 ? 'var(--chart-2)' : 'var(--chart-1)')}
				axis={false}
				props={{
					bars: { stroke: 'none', radius: 0 },
					highlight: { area: { fill: 'none' } },
					xAxis: { format: (d) => d.slice(0, 3) }
				}}
			>
				{#snippet belowMarks()}
					<Highlight area={{ class: 'fill-muted' }} />
				{/snippet}
				{#snippet tooltip()}
					<Chart.Tooltip class="w-52">
						{#snippet formatter({ value })}
							{@const amount = value as number}
							{@const isPositive = amount > 0}
							{@const isZero = amount === 0}
							<div
								class="size-2.5 shrink-0 rounded-[2px]"
								style="background-color: {isPositive
									? 'var(--chart-2)'
									: isZero
										? 'var(--muted-foreground)'
										: 'var(--chart-1)'}"
							></div>
							{isPositive ? 'Surplus' : isZero ? 'Break-even' : 'Deficit'}
							<div
								class={`ms-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums ${isPositive ? 'text-green-600 dark:text-green-400' : isZero ? 'text-muted-foreground' : 'text-destructive'}`}
							>
								{isPositive ? '+' : ''}{formatCurrency(amount)}
							</div>
						{/snippet}
					</Chart.Tooltip>
				{/snippet}
			</BarChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
