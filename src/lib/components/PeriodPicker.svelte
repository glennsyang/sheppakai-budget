<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import { monthNames } from '$lib/utils';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	// Month mode steps month by month and offers a jump-to-month menu; year mode steps whole years.
	type Props =
		| {
				mode?: 'month';
				month: number;
				year: number;
				onChange: (month: number, year: number) => void;
		  }
		| {
				mode: 'year';
				year: number;
				onChange: (year: number) => void;
		  };

	let props: Props = $props();

	function step(delta: -1 | 1) {
		if (props.mode === 'year') {
			props.onChange(props.year + delta);
			return;
		}
		let month = props.month + delta;
		let year = props.year;
		if (month === 0) {
			month = 12;
			year -= 1;
		} else if (month === 13) {
			month = 1;
			year += 1;
		}
		props.onChange(month, year);
	}

	const unit = $derived(props.mode === 'year' ? 'year' : 'month');
</script>

<div class="bg-card flex h-11 items-center rounded-[10px] border shadow-xs md:h-9">
	<Button
		variant="ghost"
		size="icon"
		class="text-muted-foreground h-full w-11 rounded-e-none md:w-9"
		aria-label="Previous {unit}"
		onclick={() => step(-1)}
	>
		<ChevronLeftIcon class="size-4" />
	</Button>
	{#if props.mode === 'year'}
		<span class="min-w-16 px-1 text-center text-sm font-medium tabular-nums">{props.year}</span>
	{:else}
		{@const current = props}
		<Select.Root
			type="single"
			value={current.month.toString()}
			onValueChange={(v) => v && current.onChange(Number(v), current.year)}
		>
			<Select.Trigger
				class="h-full! min-w-24 justify-center gap-1.5 rounded-none border-0 bg-transparent px-2 font-medium tabular-nums shadow-none sm:min-w-36 dark:bg-transparent"
				aria-label="Jump to month"
			>
				<span class="sm:hidden">{monthNames[current.month - 1].slice(0, 3)} {current.year}</span>
				<span class="max-sm:hidden">{monthNames[current.month - 1]} {current.year}</span>
			</Select.Trigger>
			<Select.Content>
				{#each monthNames as name, i (name)}
					<Select.Item value={(i + 1).toString()} label={name}>{name}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	{/if}
	<Button
		variant="ghost"
		size="icon"
		class="text-muted-foreground h-full w-11 rounded-s-none md:w-9"
		aria-label="Next {unit}"
		onclick={() => step(1)}
	>
		<ChevronRightIcon class="size-4" />
	</Button>
</div>
