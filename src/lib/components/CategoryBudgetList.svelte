<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	interface CategoryRow {
		id: string;
		name: string;
		planned: number;
		actual: number;
		color: string;
	}

	interface Props {
		categories: CategoryRow[];
		onSelect: (categoryId: string) => void;
	}

	let { categories, onSelect }: Props = $props();

	function status(row: CategoryRow) {
		if (row.planned <= 0) return row.actual > 0 ? 'unbudgeted' : 'empty';
		if (row.actual > row.planned) return 'over';
		if (row.actual / row.planned >= 0.9) return 'close';
		return 'ok';
	}
</script>

<Card.Root class="gap-0 py-1.5">
	<ul class="divide-y">
		{#each categories as row (row.id)}
			{@const state = status(row)}
			{@const pct = row.planned > 0 ? (row.actual / row.planned) * 100 : 0}
			<li>
				<button
					type="button"
					onclick={() => onSelect(row.id)}
					class="group hover:bg-muted/60 focus-visible:bg-muted/60 grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition-colors outline-none sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_9rem_1rem] sm:px-5"
				>
					<span class="flex min-w-0 items-center gap-2.5">
						<span
							class="size-2 shrink-0 rounded-full"
							style="background: {row.color}"
							aria-hidden="true"
						></span>
						<span class="truncate text-sm font-medium">{row.name}</span>
					</span>

					<span class="text-right text-sm tabular-nums sm:order-3">
						{#if state === 'over'}
							<span class="text-destructive font-medium"
								>{formatCurrency(row.actual - row.planned)} over</span
							>
						{:else if state === 'unbudgeted'}
							<span class="text-muted-foreground">{formatCurrency(row.actual)} unbudgeted</span>
						{:else if state === 'empty'}
							<span class="text-muted-foreground">No budget</span>
						{:else}
							<span class={state === 'close' ? 'text-warning font-medium' : 'font-medium'}
								>{formatCurrency(row.planned - row.actual)}</span
							>
							<span class="text-muted-foreground">left</span>
						{/if}
					</span>

					<span class="col-span-2 flex items-center gap-3 sm:order-2 sm:col-span-1">
						<span class="bg-track h-1.5 flex-1 overflow-hidden rounded-full" aria-hidden="true">
							<span
								class={[
									'block h-full rounded-full transition-[width] duration-500 ease-out',
									state === 'over'
										? 'bg-destructive'
										: state === 'close'
											? 'bg-warning'
											: state === 'unbudgeted'
												? 'bg-muted-foreground/50'
												: ''
								]}
								style="background-color: {state === 'ok' ? row.color : ''}; width: {state ===
								'unbudgeted'
									? 100
									: Math.min(pct, 100)}%"
							></span>
						</span>
						<span class="text-muted-foreground w-28 shrink-0 text-right text-xs tabular-nums">
							{formatCurrency(row.actual)}{#if row.planned > 0}<span
									class="text-muted-foreground/70">&nbsp;/ {formatCurrency(row.planned)}</span
								>{/if}
						</span>
					</span>

					<ChevronRightIcon
						class="text-muted-foreground/50 group-hover:text-muted-foreground hidden size-4 transition-transform group-hover:translate-x-0.5 sm:order-4 sm:block"
						aria-hidden="true"
					/>
				</button>
			</li>
		{/each}
	</ul>
</Card.Root>
