<script lang="ts">
	import { AreaChart } from 'layerchart';
	import InfoIcon from '@lucide/svelte/icons/info';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { TimeRangeInOutData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartData: TimeRangeInOutData[];
		chartTitle?: string;
		chartDescription?: string;
	}

	let {
		chartData,
		chartTitle = 'Income vs Spending',
		chartDescription = '6-month trend'
	}: Props = $props();

	const chartConfig = {
		in: { label: 'Income', color: 'var(--chart-2)' },
		out: { label: 'Spending', color: 'var(--chart-1)' }
	} satisfies Chart.ChartConfig;
</script>

<Card.Root class="bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	<Card.Header>
		<div class="flex items-center gap-1.5">
			<Card.Title>{chartTitle}</Card.Title>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<button {...props} class="text-muted-foreground/60 hover:text-muted-foreground">
							<InfoIcon class="size-3.5" />
						</button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content class="max-w-64">
					Overlapping area chart comparing your total income (green) against total spending (red)
					for each month. Where green is above red you had a surplus; where red is above green you
					overspent.
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<Card.Description>{chartDescription}</Card.Description>
	</Card.Header>
	<Card.Content class="px-2 sm:p-6">
		<Chart.Container config={chartConfig} class="aspect-auto h-64 w-full">
			<AreaChart
				data={chartData}
				x="month"
				series={[
					{ key: 'in', label: 'Income', color: chartConfig.in.color },
					{ key: 'out', label: 'Spending', color: chartConfig.out.color }
				]}
				seriesLayout="overlap"
				padding={{ left: 8, right: 8 }}
				props={{ xAxis: { format: (d: string) => d.slice(0, 3) } }}
				legend
			>
				{#snippet tooltip()}
					<Chart.Tooltip class="w-48">
						{#snippet formatter({ name, value, index, payload })}
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
							{#if index === payload.length - 1}
								{@const inValue = (payload.find((p) => p.key === 'in')?.value as number) ?? 0}
								{@const outValue = (payload.find((p) => p.key === 'out')?.value as number) ?? 0}
								{@const diff = inValue - outValue}
								<div class="w-full border-t border-border/50 pt-0.5"></div>
								<div
									style="--color-diff: {diff >= 0 ? 'var(--chart-2)' : 'var(--chart-1)'}"
									class="size-2.5 shrink-0 rounded-[2px] bg-(--color-diff)"
								></div>
								<span>{diff >= 0 ? 'Surplus' : 'Deficit'}</span>
								<div
									style="--color-diff: {diff >= 0 ? 'var(--chart-2)' : 'var(--chart-1)'}"
									class="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-(--color-diff) tabular-nums"
								>
									{diff < 0 ? '-' : ''}{formatCurrency(Math.abs(diff))}
								</div>
							{/if}
						{/snippet}
					</Chart.Tooltip>
				{/snippet}
			</AreaChart>
		</Chart.Container>
	</Card.Content>
</Card.Root>
