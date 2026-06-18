<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		/** CSS color value for the beam (hex, rgb, oklch, etc.) */
		color?: string;
		/** Rotation duration in seconds */
		duration?: number;
		class?: string;
		children: Snippet;
	}

	let { color = '#3b82f6', duration = 4, class: className = '', children }: Props = $props();
</script>

<!--
  Outer wrapper has no overflow:hidden so card shadows escape.
  The inner clip-layer handles overflow:hidden to constrain the spinning beam element.
  Content sits at z-index:1 above the clip layer.
-->
<div class={cn('relative rounded-xl', className)} style="padding: 1.5px;">
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
	<!-- Content: sits above the beam layer -->
	<div class="relative" style="z-index: 1;">
		{@render children()}
	</div>
</div>
