<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import type { PeriodProgress } from '$lib/utils/dates';

	interface $$Props {
		label: string;
		title: string;
		progress: PeriodProgress;
	}

	let { label, title, progress }: $$Props = $props();

	let displayPercentage = $derived.by(() => {
		if (progress.percentage <= 0) return 0;
		if (progress.percentage >= 100) return 100;

		return Math.ceil(progress.percentage);
	});

	let detailText = $derived.by(() => {
		const unitLabel = progress.totalUnits === 1 ? progress.unit : `${progress.unit}s`;

		return `${progress.elapsedUnits} of ${progress.totalUnits} ${unitLabel} elapsed`;
	});
</script>

<Card.Root class="border-border/60 bg-card/80 shadow-xs">
	<div class="px-4 py-3 sm:px-5">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
			<div class="min-w-0 sm:w-72">
				<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
					<p class="text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
						{label}
					</p>
					<h2 class="text-sm font-semibold text-foreground sm:text-[0.95rem]">{title}</h2>
					<span class="text-xs text-muted-foreground">{detailText}</span>
				</div>
			</div>
			<div class="flex min-w-0 items-center gap-3 sm:flex-1">
				<Progress
					value={progress.elapsedUnits}
					max={progress.totalUnits}
					class="h-1.5 min-w-0 flex-1 bg-primary/12"
				/>
				<div
					class="shrink-0 text-right text-sm font-semibold text-foreground tabular-nums sm:text-base"
				>
					{displayPercentage}%
				</div>
			</div>
		</div>
	</div>
</Card.Root>
