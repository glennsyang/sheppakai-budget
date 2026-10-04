<script lang="ts">
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';

	interface Props {
		message: string;
	}

	let { message }: Props = $props();
</script>

<div
	role="alert"
	class="bg-card border-destructive/30 flex items-start gap-3 rounded-xl border p-4 text-sm shadow-sm"
>
	<CircleAlertIcon class="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
	<p>{message}</p>
</div>
