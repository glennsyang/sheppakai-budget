<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		children: Snippet;
		footer?: Snippet;
	}

	let { title, description, children, footer }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div
		class="mx-4 w-full max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
	>
		<div class="text-center">
			<h1 class="text-3xl font-bold">{title}</h1>
			<p class="mt-2">{description}</p>
		</div>

		{@render children()}

		{#if footer}
			<div class="space-y-2 text-center">
				{@render footer()}
			</div>
		{/if}
	</div>
</div>
