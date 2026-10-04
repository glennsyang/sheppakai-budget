<script lang="ts">
	interface Props {
		primary: string;
		secondary?: string | null;
		mono?: boolean;
	}

	let { primary, secondary, mono = false }: Props = $props();
</script>

<span class="flex min-w-0 flex-col">
	<span class={['truncate', mono && 'font-mono text-xs']}>{primary}</span>
	{#if secondary}
		<span class="text-muted-foreground truncate text-xs">{secondary}</span>
	{/if}
</span>
