<script lang="ts">
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import CircleCheckIcon from '@lucide/svelte/icons/circle-check';

	interface Props {
		type: 'success' | 'error';
		text: string;
	}

	let { type, text }: Props = $props();
</script>

<div
	role={type === 'error' ? 'alert' : 'status'}
	class="bg-muted/60 flex items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-sm"
>
	{#if type === 'success'}
		<CircleCheckIcon class="text-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
	{:else}
		<CircleAlertIcon class="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
	{/if}
	<p>{text}</p>
</div>
