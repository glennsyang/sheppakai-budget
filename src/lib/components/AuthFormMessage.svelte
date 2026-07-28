<script lang="ts">
	interface Props {
		message: string | undefined;
	}

	let { message }: Props = $props();

	const isSuccess = $derived(message?.includes('successful') ?? false);
</script>

{#if message}
	<div class="rounded-md p-4 {isSuccess ? 'bg-green-50/80' : 'bg-red-50/80'} backdrop-blur-sm">
		<div class="text-sm {isSuccess ? 'text-green-700' : 'text-red-700'}">
			{message}
		</div>
	</div>
{/if}
