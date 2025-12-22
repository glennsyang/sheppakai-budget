<script lang="ts">
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';

	import { Button } from '$lib/components/ui/button';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<!-- Simple layout for auth routes without header/navigation -->
	<header class="w-full border-b border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<div class="text-xl font-bold">Budget Tracker</div>
			<div class="space-x-2">
				<Button onclick={toggleMode} variant="outline" size="icon">
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
		</div>
	</header>
	{@render children()}
</div>
