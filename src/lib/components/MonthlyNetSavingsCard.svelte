<script lang="ts">
	import type { TimeRangeInOutData } from '$lib';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartData: TimeRangeInOutData[];
	}

	let { chartData }: Props = $props();

	let totalIncome = $derived(chartData.reduce((sum, d) => sum + d.in, 0));
	let totalSpent = $derived(chartData.reduce((sum, d) => sum + d.out, 0));
	let totalNet = $derived(totalIncome - totalSpent);
</script>

<Card.Root class="shadow-xs">
	<Card.Header class="pb-3">
		<Card.Title class="text-base font-medium text-muted-foreground">Net Savings</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if chartData.length === 0}
			<p class="text-sm text-muted-foreground">No data available.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left text-muted-foreground">
							<th class="pb-2 font-medium">Month</th>
							<th class="pb-2 text-right font-medium">Income</th>
							<th class="pb-2 text-right font-medium">Spent</th>
							<th class="pb-2 text-right font-medium">Net</th>
						</tr>
					</thead>
					<tbody>
						{#each chartData as row (row.month)}
							{@const net = row.in - row.out}
							<tr class="border-b border-border/50 last:border-0">
								<td class="py-2.5">{row.month}</td>
								<td class="py-2.5 text-right tabular-nums">{formatCurrency(row.in)}</td>
								<td class="py-2.5 text-right tabular-nums">{formatCurrency(row.out)}</td>
								<td
									class={`py-2.5 text-right font-medium tabular-nums ${net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
								>
									{net >= 0 ? '+' : ''}{formatCurrency(net)}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr class="border-t-2 border-border">
							<td class="pt-2.5 font-bold">Total</td>
							<td class="pt-2.5 text-right font-bold tabular-nums">{formatCurrency(totalIncome)}</td
							>
							<td class="pt-2.5 text-right font-bold tabular-nums">{formatCurrency(totalSpent)}</td>
							<td
								class={`pt-2.5 text-right font-bold tabular-nums ${totalNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}
							>
								{totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
