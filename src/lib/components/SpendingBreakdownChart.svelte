<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import type { SpendingBreakdownData } from '$lib/types';
	import { abbreviateCategoryName, formatCurrency } from '$lib/utils';
	import { Arc, PieChart, Text } from 'layerchart';

	interface Props {
		chartData: SpendingBreakdownData[];
		totalSpent: number;
	}

	let { chartData, totalSpent }: Props = $props();

	let chartConfig = $derived(
		Object.fromEntries(chartData.map((d) => [d.category, { label: d.category, color: d.color }]))
	) satisfies Chart.ChartConfig;

	let hasData = $derived(chartData.length > 0 && totalSpent > 0);
	let sortedChartData = $derived([...chartData].sort((a, b) => b.amount - a.amount));
</script>

<div class="flex flex-col gap-4 lg:flex-row lg:justify-between">
	<div class="w-full lg:flex-1/2">
		<Card.Root class="from-primary/5 to-card dark:bg-card bg-linear-to-t shadow-xs">
			<Card.Header>
				<Card.Title>Spending Breakdown</Card.Title>
				<Card.Description>Amount and share per category</Card.Description>
			</Card.Header>
			<div class="mb-4 w-full space-y-1.5 px-2">
				{#each sortedChartData as item (item.category)}
					<div class="flex items-center justify-between text-sm">
						<div class="flex min-w-0 items-center gap-2">
							<div
								class="size-2.5 shrink-0 rounded-sm"
								style="background-color: {item.color}"
							></div>
							<span class="text-muted-foreground truncate">{item.category}</span>
						</div>
						<div class="ml-2 flex shrink-0 items-center gap-2">
							<span class="font-medium tabular-nums">{formatCurrency(item.amount)}</span>
							<span class="text-muted-foreground w-10 text-right text-xs">
								{totalSpent > 0 ? ((item.amount / totalSpent) * 100).toFixed(0) : 0}%
							</span>
						</div>
					</div>
				{/each}
			</div>
		</Card.Root>
	</div>
	<div class="w-full lg:flex-1/2">
		<Card.Root class="from-primary/5 to-card dark:bg-card bg-linear-to-t shadow-xs">
			<Card.Header>
				<Card.Title>Spending by Category</Card.Title>
				<Card.Description>Where your money went this month</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1">
				{#if !hasData}
					<div class="text-muted-foreground flex h-48 items-center justify-center text-sm">
						No spending recorded yet
					</div>
				{:else}
					<Chart.Container config={chartConfig} class="mx-auto aspect-square max-h-62.5">
						<PieChart
							data={chartData}
							key="category"
							value="amount"
							label={(d) =>
								`${d.category}: ${formatCurrency(d.amount)} (${((d.amount / totalSpent) * 100).toFixed(0)}%)`}
							cRange={chartData.map((d) => d.color)}
							c="color"
							props={{
								pie: {
									motion: 'tween'
								}
							}}
						>
							{#snippet tooltip()}
								<Chart.Tooltip hideLabel />
							{/snippet}
							{#snippet arc({ props, visibleData, index })}
								{@const category = visibleData[index].category}
								<Arc {...props}>
									{#snippet children({ centroid })}
										{@const displayCategory = abbreviateCategoryName(category)}
										<Text
											value={displayCategory}
											x={centroid[0]}
											y={centroid[1]}
											textAnchor="middle"
											verticalAnchor="middle"
											font-size="12"
											class="fill-background"
										/>
									{/snippet}
								</Arc>
							{/snippet}
						</PieChart>
					</Chart.Container>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
