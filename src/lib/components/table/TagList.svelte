<script lang="ts">
	let { tags }: { tags: string[] } = $props();
</script>

{#if tags.length}
	<span class="flex flex-wrap gap-1">
		{#each tags as tag (tag)}
			<span class="text-muted-foreground rounded-md border px-1.5 py-0.5 font-mono text-[0.6875rem]"
				>{tag}</span
			>
		{/each}
	</span>
{:else}
	<span class="text-muted-foreground">—</span>
{/if}
