<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
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
	<Card.Root class="border-destructive/40 bg-destructive/5">
		<Card.Content class="px-4 py-3">
			<div class="flex flex-wrap items-center gap-3">
				<div class="flex shrink-0 items-center gap-2">
					<AlertTriangleIcon class="text-destructive size-4" />
					<Badge variant="destructive" class="text-xs">
						{overBudgetCategories.length}
						{overBudgetCategories.length === 1 ? 'category' : 'categories'} over budget
					</Badge>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each overBudgetCategories as cat (cat.id)}
						<button
							onclick={() => onViewCategory(cat.id)}
							class="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
						>
							{cat.name}
							<span class="font-bold">+{formatCurrency(cat.actual - cat.planned)}</span>
						</button>
					{/each}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
{/if}
