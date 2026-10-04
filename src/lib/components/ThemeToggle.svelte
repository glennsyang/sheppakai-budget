<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
</script>

<Button
	onclick={toggleMode}
	variant="ghost"
	size="icon"
	class="text-muted-foreground h-11 w-11 md:h-8 md:w-8"
>
	<SunIcon
		class="h-[1.1rem] w-[1.1rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
	/>
	<MoonIcon
		class="absolute h-[1.1rem] w-[1.1rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
