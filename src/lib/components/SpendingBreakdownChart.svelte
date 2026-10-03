<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { SpendingBreakdownData } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { Arc, PieChart } from 'layerchart';

	interface Props {
		chartData: SpendingBreakdownData[];
		onSliceClick?: (categoryId: string) => void;
	}

	let { chartData, onSliceClick }: Props = $props();

	let chartConfig = $derived(
		Object.fromEntries(chartData.map((d) => [d.category, { label: d.category, color: d.color }]))
	) satisfies Chart.ChartConfig;

	let sortedChartData = $derived([...chartData].toSorted((a, b) => b.amount - a.amount));
	// Share of discretionary category spend, so the rows add up to 100%.
	let categoryTotal = $derived(chartData.reduce((sum, d) => sum + d.amount, 0));
	let hasData = $derived(chartData.length > 0 && categoryTotal > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-base tracking-tight">Spending by category</Card.Title>
		<Card.Description>
			{#if hasData}
				{formatCurrency(categoryTotal)} of discretionary spending, recurring excluded.
			{:else}
				Where discretionary spending goes this month.
			{/if}
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex-1">
		{#if !hasData}
			<p class="text-muted-foreground bg-muted/50 rounded-lg px-4 py-8 text-center text-sm">
				Nothing logged yet. Categories appear here as you spend.
			</p>
		{:else}
			<div class="grid items-center gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
				<Chart.Container config={chartConfig} class="mx-auto aspect-square w-40">
					<PieChart
						data={chartData}
						key="category"
						value="amount"
						innerRadius={-14}
						cornerRadius={3}
						padAngle={0.015}
						label={(d) =>
							`${d.category}: ${formatCurrency(d.amount)} (${((d.amount / categoryTotal) * 100).toFixed(0)}%)`}
						cRange={chartData.map((d) => d.color)}
						c="color"
					>
						{#snippet tooltip()}
							<Chart.Tooltip hideLabel />
						{/snippet}
						{#snippet arc({ props, visibleData, index })}
							{@const categoryId = visibleData[index].categoryId}
							<Arc
								{...props}
								onclick={categoryId ? () => onSliceClick?.(categoryId) : undefined}
								class={categoryId ? 'cursor-pointer' : ''}
							/>
						{/snippet}
					</PieChart>
				</Chart.Container>
				<ul class="space-y-0.5">
					{#each sortedChartData as item (item.category)}
						{@const share = (item.amount / categoryTotal) * 100}
						<li>
							<button
								type="button"
								disabled={!item.categoryId}
								onclick={() => item.categoryId && onSliceClick?.(item.categoryId)}
								class="hover:bg-muted/60 focus-visible:ring-ring/50 grid w-full grid-cols-[minmax(0,1fr)_auto_2.5rem] items-center gap-x-3 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-[3px] disabled:cursor-default disabled:hover:bg-transparent"
							>
								<span class="flex min-w-0 items-center gap-2">
									<span
										class="size-2 shrink-0 rounded-full"
										style="background-color: {item.color}"
										aria-hidden="true"
									></span>
									<span class="truncate">{item.category}</span>
								</span>
								<span class="font-medium tabular-nums">{formatCurrency(item.amount)}</span>
								<span class="text-muted-foreground text-right text-xs tabular-nums"
									>{share.toFixed(0)}%</span
								>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
