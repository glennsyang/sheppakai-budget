<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import type { Recurring } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { actionMessage } from '$lib/utils/actionMessage';
	import { getCurrentPeriodDueDate, getDaysUntilDue } from '$lib/utils/dates';
	import { CalendarClockIcon } from '@lucide/svelte/icons';
	import { toast } from 'svelte-sonner';

	interface Props {
		recurring: Recurring[];
	}

	let { recurring }: Props = $props();

	const UPCOMING_WINDOW_DAYS = 14;

	type UpcomingBill = { item: Recurring; daysUntilDue: number };

	let upcoming = $derived.by<UpcomingBill[]>(() => {
		const now = new Date();

		return recurring
			.filter((item) => !item.paid && item.dueDay != null)
			.map((item) => ({
				item,
				daysUntilDue: getDaysUntilDue(
					getCurrentPeriodDueDate(item.dueDay as number, item.dueMonth, item.cadence, now),
					now
				)
			}))
			.filter(({ daysUntilDue }) => daysUntilDue <= UPCOMING_WINDOW_DAYS)
			.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
	});

	let togglingId = $state<string | null>(null);

	function dueLabel(daysUntilDue: number): string {
		if (daysUntilDue < 0) {
			const overdueDays = Math.abs(daysUntilDue);
			return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
		}
		if (daysUntilDue === 0) return 'Due today';
		if (daysUntilDue === 1) return 'Due tomorrow';
		return `Due in ${daysUntilDue} days`;
	}

	function badgeClass(daysUntilDue: number): string {
		if (daysUntilDue < 0) return 'bg-destructive hover:bg-destructive text-white';
		if (daysUntilDue <= 1) return 'bg-amber-500 hover:bg-amber-500 text-white';
		return 'bg-muted-foreground/30 hover:bg-muted-foreground/30 text-white';
	}
</script>

<Card.Root>
	<Card.Header class="pb-3">
		<div class="flex items-center gap-2">
			<CalendarClockIcon class="text-muted-foreground size-4" />
			<Card.Title class="text-base">Upcoming Bills</Card.Title>
		</div>
	</Card.Header>
	<Card.Content class="pt-0">
		{#if upcoming.length === 0}
			<p class="text-muted-foreground py-4 text-center text-sm">No bills due soon</p>
		{:else}
			<div class="max-h-72 overflow-y-auto">
				{#each upcoming as { item, daysUntilDue }, i (item.id)}
					{#if i > 0}
						<Separator.Root class="my-0" />
					{/if}
					<div class="flex flex-wrap items-center justify-between gap-2 py-2.5">
						<p class="text-sm font-medium">{item.merchant}</p>
						<div class="flex items-center gap-2">
							<Badge class="text-xs {badgeClass(daysUntilDue)}">{dueLabel(daysUntilDue)}</Badge>
							<span class="text-sm font-semibold tabular-nums">{formatCurrency(item.amount)}</span>
							<form
								method="POST"
								action="/recurring?/togglePaid"
								use:enhance={() => {
									togglingId = item.id;
									return async ({ result, update }) => {
										if (result.type === 'success') {
											await invalidateAll();
										} else {
											const { text } = actionMessage(result, {
												success: 'Marked as paid',
												error: 'Failed to mark as paid'
											});
											toast.error(text);
										}
										await update();
										togglingId = null;
									};
								}}
							>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="paid" value="true" />
								<Button
									type="submit"
									size="sm"
									variant="outline"
									class="h-7 px-2 text-xs"
									disabled={togglingId === item.id}
								>
									{togglingId === item.id ? 'Saving...' : 'Mark Paid'}
								</Button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
