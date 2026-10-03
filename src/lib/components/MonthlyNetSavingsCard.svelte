<script lang="ts">
	import type { TimeRangeInOutData } from '$lib';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		chartData: TimeRangeInOutData[];
		/** e.g. "May - Oct 2026" — the table covers only these months. */
		rangeLabel: string;
	}

	let { chartData, rangeLabel }: Props = $props();

	let totalIncome = $derived(chartData.reduce((sum, d) => sum + d.in, 0));
	let totalSpent = $derived(chartData.reduce((sum, d) => sum + d.out, 0));
	let totalNet = $derived(totalIncome - totalSpent);

	function signed(amount: number) {
		return `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${formatCurrency(Math.abs(amount))}`;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-base tracking-tight">Month by month</Card.Title>
		<Card.Description>{rangeLabel}, income less all spending.</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if chartData.length === 0}
			<p class="text-muted-foreground bg-muted/50 rounded-lg px-4 py-8 text-center text-sm">
				No months to show yet.
			</p>
		{:else}
			<div>
				<table class="w-full text-sm">
					<thead>
						<tr class="text-muted-foreground border-b text-left text-xs">
							<th class="pb-2 font-normal">Month</th>
							<th class="hidden pb-2 text-right font-normal sm:table-cell">Income</th>
							<th class="hidden pb-2 text-right font-normal sm:table-cell">Spent</th>
							<th class="pb-2 text-right font-normal">Net</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each chartData as row (row.month)}
							{@const net = row.in - row.out}
							<tr>
								<td class="py-2.5">
									{row.month}
									<span class="text-muted-foreground block text-xs tabular-nums sm:hidden"
										>{formatCurrency(row.in)} in · {formatCurrency(row.out)} out</span
									>
								</td>
								<td class="hidden py-2.5 text-right tabular-nums sm:table-cell"
									>{formatCurrency(row.in)}</td
								>
								<td class="hidden py-2.5 text-right tabular-nums sm:table-cell"
									>{formatCurrency(row.out)}</td
								>
								<td
									class={[
										'py-2.5 text-right font-medium tabular-nums',
										net >= 0 ? 'text-positive' : 'text-destructive'
									]}
								>
									{signed(net)}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr class="border-t">
							<td class="pt-3 font-semibold">
								Total
								<span class="text-muted-foreground block text-xs font-normal tabular-nums sm:hidden"
									>{formatCurrency(totalIncome)} in · {formatCurrency(totalSpent)} out</span
								>
							</td>
							<td class="hidden pt-3 text-right font-semibold tabular-nums sm:table-cell"
								>{formatCurrency(totalIncome)}</td
							>
							<td class="hidden pt-3 text-right font-semibold tabular-nums sm:table-cell"
								>{formatCurrency(totalSpent)}</td
							>
							<td
								class={[
									'pt-3 text-right font-semibold tabular-nums',
									totalNet >= 0 ? 'text-positive' : 'text-destructive'
								]}
							>
								{signed(totalNet)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
