<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import type { Recurring } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { ChevronDownIcon } from '@lucide/svelte/icons';

	interface Props {
		recurring: Recurring[];
		monthlyTotal: number;
		isCurrentMonth: boolean;
	}

	let { recurring, monthlyTotal, isCurrentMonth }: Props = $props();

	let open = $state(true);

	let sorted = $derived([...recurring].toSorted((a, b) => b.amount - a.amount));
</script>

<Card.Root>
	<Collapsible.Root bind:open>
		<Card.Header class="pb-3">
			<div class="flex items-center justify-between">
				<Card.Title class="text-base tracking-tight">Recurring expenses</Card.Title>
				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold tabular-nums">{formatCurrency(monthlyTotal)}/mo</span>
					<Collapsible.Trigger class="group flex cursor-pointer items-center">
						<ChevronDownIcon
							class="text-muted-foreground size-4 transition-transform duration-200 {open
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
					<p class="text-muted-foreground py-4 text-center text-sm">No recurring expenses</p>
				{:else}
					<div>
						{#each sorted as item, i (item.id)}
							{#if i > 0}
								<Separator.Root class="my-0" />
							{/if}
							<div class="flex items-center justify-between py-2.5">
								<div class="flex items-center gap-2">
									<div>
										<p class="text-sm font-medium">{item.merchant}</p>
										{#if item.description}
											<p class="text-muted-foreground text-xs">{item.description}</p>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2">
									{#if isCurrentMonth}
										{#if item.paid}
											<Badge class="bg-positive/12 text-positive border-transparent text-xs"
												>Paid</Badge
											>
										{:else}
											<Badge variant="outline" class="text-muted-foreground text-xs"
												>Not yet paid</Badge
											>
										{/if}
									{/if}
									{#if item.cadence !== 'Monthly'}
										<Badge variant="outline" class="text-xs">
											{item.cadence}
										</Badge>
									{/if}
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
