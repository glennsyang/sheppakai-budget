<script lang="ts">
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();
</script>

<div class="bg-sidebar flex min-h-dvh flex-col">
	<header class="flex h-14 items-center justify-between px-4 sm:px-6">
		<BrandMark />
		<ThemeToggle />
	</header>
	<main class="flex flex-1 flex-col items-center px-4 pt-[8vh] pb-12 sm:justify-center sm:pt-0">
		<div class="w-full max-w-sm">
			{@render children()}
		</div>
	</main>
</div>
