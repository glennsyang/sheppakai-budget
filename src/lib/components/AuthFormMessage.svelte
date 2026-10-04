<script lang="ts">
	import FormMessage from '$lib/components/FormMessage.svelte';

	interface Props {
		message: App.Superforms.Message | undefined;
	}

	let { message }: Props = $props();
</script>

{#if message}
	<FormMessage type={message.type === 'success' ? 'success' : 'error'} text={message.text} />
{/if}
