<script lang="ts">
	import { ChevronDownIcon, RepeatIcon } from '@lucide/svelte/icons';

	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import type { Recurring } from '$lib/types';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		recurring: Recurring[];
		monthlyTotal: number;
	}

	let { recurring, monthlyTotal }: Props = $props();

	let open = $state(true);

	let sorted = $derived([...recurring].sort((a, b) => b.amount - a.amount));
</script>

<Card.Root>
	<Collapsible.Root bind:open>
		<Card.Header class="pb-3">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<RepeatIcon class="size-4 text-muted-foreground" />
					<Card.Title class="text-base">Recurring Expenses</Card.Title>
				</div>
				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold tabular-nums">{formatCurrency(monthlyTotal)}/mo</span>
					<Collapsible.Trigger class="group flex cursor-pointer items-center">
						<ChevronDownIcon
							class="size-4 text-muted-foreground transition-transform duration-200 {open
								? ''
								: '-rotate-90'}"
						/>
					</Collapsible.Trigger>
				</div>
			</div>
		</Card.Header>
		<Collapsible.Content>
			<Card.Content class="pt-0">
				{#if sorted.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">No recurring expenses</p>
				{:else}
					<div class="max-h-72 overflow-y-auto">
						{#each sorted as item, i (item.id)}
							{#if i > 0}
								<Separator.Root class="my-0" />
							{/if}
							<div class="flex items-center justify-between py-2.5">
								<div class="flex items-center gap-2">
									<div>
										<p class="text-sm font-medium">{item.merchant}</p>
										{#if item.description}
											<p class="text-xs text-muted-foreground">{item.description}</p>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2">
									{#if item.paid}
										<Badge class="bg-green-500 text-xs text-white hover:bg-green-500">Paid</Badge>
									{:else}
										<Badge
											class="bg-muted-foreground/30 text-xs text-white hover:bg-muted-foreground/30"
											>Not Yet Paid</Badge
										>
									{/if}
									<Badge variant="outline" class="text-xs">
										{item.cadence}
									</Badge>
									<span class="text-sm font-semibold tabular-nums"
										>{formatCurrency(item.amount)}</span
									>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Collapsible.Content>
	</Collapsible.Root>
</Card.Root>
