<script lang="ts">
	import type { ExcludedSpendCategory } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		total: number;
		breakdown: ExcludedSpendCategory[];
		maxRows?: number;
	}

	let { total, breakdown, maxRows = 4 }: Props = $props();

	let visibleRows = $derived(breakdown.slice(0, maxRows));
	let remainingCount = $derived(Math.max(0, breakdown.length - maxRows));
</script>

<p class="font-medium text-amber-900 dark:text-amber-200">
	Excluded from budget: {formatCurrency(total)}
</p>
{#if visibleRows.length > 0}
	<div class="mt-1.5 space-y-0.5">
		{#each visibleRows as row (row.categoryId ?? row.categoryName)}
			<div class="flex items-center justify-between text-amber-800 dark:text-amber-300">
				<span class="truncate">{row.categoryName}</span>
				<span class="ml-2 shrink-0 tabular-nums">{formatCurrency(row.amount)}</span>
			</div>
		{/each}
		{#if remainingCount > 0}
			<p class="text-amber-700/70 dark:text-amber-400/70">+{remainingCount} more</p>
		{/if}
	</div>
{:else}
	<p class="mt-0.5 text-amber-700 dark:text-amber-300">
		Tracked separately and not counted in budget usage.
	</p>
{/if}
