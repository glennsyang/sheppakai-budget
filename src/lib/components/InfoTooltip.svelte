<script lang="ts">
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';

	interface Props {
		text: string;
		maxWidth?: string;
		size?: 'sm' | 'default';
	}

	let { text, maxWidth = 'max-w-64', size = 'default' }: Props = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<button
				type="button"
				aria-label={text}
				{...props}
				class="text-muted-foreground/60 hover:text-muted-foreground"
				onmouseenter={() => (open = true)}
				onmouseleave={() => (open = false)}
				onfocus={() => (open = true)}
				onblur={() => (open = false)}
			>
				<InfoIcon class={size === 'sm' ? 'size-3' : 'size-3.5'} />
			</button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		class={cn(
			'w-auto rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md ring-0',
			maxWidth
		)}
	>
		{text}
	</Popover.Content>
</Popover.Root>
