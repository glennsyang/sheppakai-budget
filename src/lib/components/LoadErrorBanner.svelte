<script lang="ts">
	interface Props {
		message: string;
	}

	let { message }: Props = $props();
</script>

<div
	role="alert"
	class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm"
>
	{message}
</div>
