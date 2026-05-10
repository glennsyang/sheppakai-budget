<script lang="ts">
	import { WrenchIcon } from '@lucide/svelte/icons';

	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		revenue: number;
		jobCount: number;
	}

	let { revenue, jobCount }: Props = $props();
</script>

<Card.Root class="gap-3 py-4">
	<Card.Content class="px-4">
		<div class="flex items-center gap-2">
			<WrenchIcon class="size-3.5 text-muted-foreground" />
			<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				Window Cleaning
			</p>
		</div>
		<p class="mt-1 text-2xl font-bold text-amber-600 tabular-nums dark:text-amber-400">
			{formatCurrency(revenue)}
		</p>
		<div class="mt-0.5 flex items-center gap-1.5">
			<Badge variant="secondary" class="text-xs">
				{jobCount}
				{jobCount === 1 ? 'job' : 'jobs'}
			</Badge>
			<span class="text-xs text-muted-foreground">this month</span>
		</div>
	</Card.Content>
</Card.Root>
