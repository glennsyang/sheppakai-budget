<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		/** Period picker and the page's one primary action, right-aligned from `lg`. */
		actions?: Snippet;
		children: Snippet;
		class?: string;
	}

	let { title, subtitle, actions, children, class: className }: Props = $props();
</script>

<div class={['mx-auto flex w-full max-w-7xl flex-col gap-4 py-4 sm:py-6', className]}>
	<header class="mb-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div class="min-w-0">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
			{#if subtitle}
				<p class="text-muted-foreground mt-1 text-sm">{subtitle}</p>
			{/if}
		</div>
		{#if actions}
			<div class="flex flex-wrap items-center gap-2">
				{@render actions()}
			</div>
		{/if}
	</header>
	{@render children()}
</div>
