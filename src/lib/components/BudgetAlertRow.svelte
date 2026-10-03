<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils';
	import { AlertTriangleIcon } from '@lucide/svelte/icons';

	interface OverBudgetCategory {
		id: string;
		name: string;
		actual: number;
		planned: number;
	}

	interface Props {
		overBudgetCategories: OverBudgetCategory[];
		onViewCategory: (categoryId: string) => void;
	}

	let { overBudgetCategories, onViewCategory }: Props = $props();
</script>

{#if overBudgetCategories.length > 0}
	<Card.Root class="border-destructive/30 py-0">
		<div class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-sm sm:px-5">
			<span class="text-destructive flex shrink-0 items-center gap-2 font-medium">
				<AlertTriangleIcon class="size-4" />
				{overBudgetCategories.length}
				{overBudgetCategories.length === 1 ? 'category' : 'categories'} over budget
			</span>
			<span class="flex flex-wrap gap-1.5">
				{#each overBudgetCategories as cat (cat.id)}
					<button
						type="button"
						onclick={() => onViewCategory(cat.id)}
						class="hover:bg-muted focus-visible:ring-ring/50 flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]"
					>
						{cat.name}
						<span class="text-destructive tabular-nums"
							>+{formatCurrency(cat.actual - cat.planned)}</span
						>
					</button>
				{/each}
			</span>
		</div>
	</Card.Root>
{/if}
