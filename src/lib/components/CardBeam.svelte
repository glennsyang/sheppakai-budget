<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		/** CSS color value for the beam (hex, rgb, oklch, etc.) */
		color?: string;
		/** Rotation duration in seconds */
		duration?: number;
		/** Whether the beam renders at all — false skips the animated border while still rendering children. */
		active?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		color = '#3b82f6',
		duration = 4,
		active = true,
		class: className = '',
		children
	}: Props = $props();
</script>

<!--
  Outer wrapper has no overflow:hidden so card shadows escape.
  The inner clip-layer handles overflow:hidden to constrain the spinning beam element.
  Content sits at z-index:1 above the clip layer.
-->
<div class={cn('relative rounded-xl', active && 'p-[1.5px]', className)}>
	{#if active}
		<!-- Beam clip container: same size as outer wrapper, clips the oversized spinner -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden="true">
			<span
				style="
					position: absolute;
					inset: -150%;
					background: conic-gradient(from 0deg, transparent 70%, {color} 85%, transparent 95%);
					animation: card-beam-spin {duration}s linear infinite;
				"
			></span>
		</div>
	{/if}
	<!-- Content: sits above the beam layer -->
	<div class="relative" style="z-index: 1;">
		{@render children()}
	</div>
</div>
