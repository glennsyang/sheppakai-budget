<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import type { Snippet } from 'svelte';

	let {
		onEdit,
		onDelete,
		deleteLabel = 'Delete',
		stopTriggerPropagation = false,
		children
	}: {
		onEdit?: () => void;
		onDelete?: () => void;
		deleteLabel?: string;
		/** Keep the trigger click from reaching a clickable row underneath. */
		stopTriggerPropagation?: boolean;
		/** Extra `DropdownMenu.Item`s, rendered between Edit and Delete. */
		children?: Snippet;
	} = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props }: { props: Record<string, unknown> })}
			<Button
				{...props}
				variant="ghost"
				size="icon"
				class="relative size-8 p-0"
				onclick={(e: MouseEvent) => {
					if (stopTriggerPropagation) e.stopPropagation();
					(props.onclick as ((event: MouseEvent) => void) | undefined)?.(e);
				}}
			>
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#if onEdit}
			<DropdownMenu.Item onclick={onEdit}>Edit</DropdownMenu.Item>
		{/if}
		{@render children?.()}
		{#if onDelete}
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="text-destructive focus:text-destructive" onclick={onDelete}>
				{deleteLabel}
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
