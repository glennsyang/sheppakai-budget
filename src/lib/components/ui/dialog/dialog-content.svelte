<script lang="ts">
	import XIcon from '@lucide/svelte/icons/x';
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	import * as Dialog from './index.js';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			// Phones get a bottom sheet (thumb reach, keyboard-safe scroll); larger screens a centred dialog.
			'fixed z-50 grid w-full gap-4 border bg-popover text-popover-foreground shadow-md duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
			'inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl border-x-0 border-b-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
			'sm:inset-x-auto sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:max-h-[calc(100dvh-4rem)] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border sm:p-6 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close
				class="absolute top-3 right-3 flex size-9 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-hidden disabled:pointer-events-none sm:top-4 sm:right-4 sm:size-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
			>
				<XIcon />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</Dialog.Portal>
