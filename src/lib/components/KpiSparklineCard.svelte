<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { AreaChart } from 'layerchart';

	interface Props {
		label: string;
		labelNote?: string;
		value: string;
		subtext?: string;
		tooltip?: string;
		colorScheme?: 'green' | 'amber' | 'red' | 'neutral';
		sparklineData?: { month: string; value: number }[];
		trendDirection?: 'up' | 'down' | 'flat' | null;
		trendLabel?: string;
	}

	let {
		label,
		labelNote,
		value,
		subtext,
		tooltip,
		colorScheme = 'neutral',
		sparklineData = [],
		trendDirection,
		trendLabel
	}: Props = $props();

	let valueColor = $derived(
		colorScheme === 'green'
			? 'text-green-600 dark:text-green-400'
			: colorScheme === 'red'
				? 'text-destructive'
				: colorScheme === 'amber'
					? 'text-amber-600 dark:text-amber-400'
					: 'text-foreground'
	);

	let chartColor = $derived(
		colorScheme === 'green'
			? 'var(--chart-2)'
			: colorScheme === 'red'
				? 'var(--chart-1)'
				: colorScheme === 'amber'
					? 'var(--chart-4)'
					: 'var(--chart-3)'
	);

	let chartConfig = $derived({
		value: { label, color: chartColor }
	} satisfies Chart.ChartConfig);
</script>

<Card.Root class="gap-3 py-4">
	<Card.Content class="px-4">
		<div class="flex items-center gap-1">
			<p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
				{label}{#if labelNote}<span class="ml-1 font-normal tracking-normal normal-case"
						>{labelNote}</span
					>{/if}
			</p>
			{#if tooltip}
				<InfoTooltip text={tooltip} size="sm" />
			{/if}
		</div>
		<p class="mt-1 text-2xl font-bold tabular-nums {valueColor}">{value}</p>
		{#if subtext}
			<p class="text-muted-foreground mt-0.5 text-xs">{subtext}</p>
		{/if}

		{#if trendDirection && trendLabel}
			<div class="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
				{#if trendDirection === 'up'}
					<TrendingUpIcon class="size-3" />
				{:else if trendDirection === 'down'}
					<TrendingDownIcon class="size-3" />
				{:else}
					<MinusIcon class="size-3" />
				{/if}
				<span>{trendLabel}</span>
			</div>
		{/if}

		{#if sparklineData.length > 1}
			<div class="pointer-events-none mt-3 h-12 w-full">
				<Chart.Container config={chartConfig} class="h-full w-full">
					<AreaChart
						data={sparklineData}
						x="month"
						series={[{ key: 'value', label, color: chartColor }]}
						padding={{ top: 4, bottom: 4, left: 0, right: 0 }}
						props={{ xAxis: { format: (d: string) => d.slice(0, 3) } }}
					/>
				</Chart.Container>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
