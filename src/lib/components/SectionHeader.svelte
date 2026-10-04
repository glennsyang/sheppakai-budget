<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description, actions }: Props = $props();
</script>

<div class="flex flex-wrap items-end justify-between gap-3 pt-2">
	<div class="min-w-0">
		<h2 class="text-base font-semibold tracking-tight">{title}</h2>
		{#if description}
			<p class="text-muted-foreground mt-0.5 text-sm">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex items-center gap-2">{@render actions()}</div>
	{/if}
</div>
