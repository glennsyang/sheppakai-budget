<script lang="ts" module>
	export type StatTone = 'positive' | 'warning' | 'negative' | 'neutral';

	export interface Stat {
		label: string;
		value: string;
		subtext?: string;
		tooltip?: string;
		tone?: StatTone;
		/** 0–100+ fill for a thin meter under the value. */
		meter?: number;
		trend?: { direction: 'up' | 'down' | 'flat'; label: string };
	}
</script>

<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import ArrowDownRightIcon from '@lucide/svelte/icons/arrow-down-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import MinusIcon from '@lucide/svelte/icons/minus';

	let { stats }: { stats: Stat[] } = $props();

	const toneText: Record<StatTone, string> = {
		positive: 'text-positive',
		warning: 'text-warning',
		negative: 'text-destructive',
		neutral: 'text-foreground'
	};
	const toneFill: Record<StatTone, string> = {
		positive: 'bg-positive',
		warning: 'bg-warning',
		negative: 'bg-destructive',
		neutral: 'bg-foreground/50'
	};
</script>

<Card.Root class="gap-0 overflow-hidden py-0">
	<dl class="bg-border flex flex-wrap gap-px">
		{#each stats as stat (stat.label)}
			{@const tone = stat.tone ?? 'neutral'}
			<div
				class="bg-card flex min-w-0 flex-[1_1_calc(50%-1px)] flex-col gap-1 p-4 sm:flex-[1_1_calc(33.333%-1px)] sm:p-5 lg:flex-[1_1_0]"
			>
				<dt class="text-muted-foreground flex items-center gap-1 text-xs">
					<span class="truncate">{stat.label}</span>
					{#if stat.tooltip}
						<InfoTooltip text={stat.tooltip} size="sm" />
					{/if}
				</dt>
				<dd class={['text-xl font-semibold tracking-tight tabular-nums', toneText[tone]]}>
					{stat.value}
				</dd>
				{#if stat.meter !== undefined}
					<div class="bg-track mt-1 h-1 overflow-hidden rounded-full" aria-hidden="true">
						<div
							class={[
								'h-full rounded-full transition-[width] duration-500 ease-out',
								toneFill[tone]
							]}
							style="width: {Math.min(Math.max(stat.meter, 0), 100)}%"
						></div>
					</div>
				{/if}
				{#if stat.subtext}
					<dd class="text-muted-foreground text-xs">{stat.subtext}</dd>
				{/if}
				{#if stat.trend}
					<dd class="text-muted-foreground mt-auto flex items-center gap-1 pt-1 text-xs">
						{#if stat.trend.direction === 'up'}
							<ArrowUpRightIcon class="size-3.5 shrink-0" />
						{:else if stat.trend.direction === 'down'}
							<ArrowDownRightIcon class="size-3.5 shrink-0" />
						{:else}
							<MinusIcon class="size-3.5 shrink-0" />
						{/if}
						<span class="text-pretty">{stat.trend.label}</span>
					</dd>
				{/if}
			</div>
		{/each}
	</dl>
</Card.Root>
