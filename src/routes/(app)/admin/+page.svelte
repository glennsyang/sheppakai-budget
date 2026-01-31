<script lang="ts">
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/admin/users', { replaceState: true });
	});
</script>

<div class="flex h-64 items-center justify-center">
	<p class="text-muted-foreground">Redirecting to users...</p>
</div>
