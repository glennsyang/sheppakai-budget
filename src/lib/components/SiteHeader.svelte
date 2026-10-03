<script lang="ts">
	import { page } from '$app/state';
	import type { SidebarData } from '$lib';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';

	interface Props {
		sidebarData: SidebarData;
	}

	let { sidebarData }: Props = $props();

	// Section and page title from the nav: "Receipts / Fuel", or just "Dashboard".
	const sections: [string | null, { title: string; url?: string }[]][] = $derived([
		[null, sidebarData.navMain],
		['Savings', sidebarData.navSavings],
		['Receipts', sidebarData.navReceipts],
		['Window Cleaning', sidebarData.navWindows],
		['Setup', sidebarData.navSetup]
	]);

	let crumb = $derived.by(() => {
		const path = page.url.pathname;
		let best: { section: string | null; title: string; length: number } | null = null;
		for (const [section, items] of sections) {
			for (const item of items) {
				if (!item.url || !(path === item.url || path.startsWith(`${item.url}/`))) continue;
				if (!best || item.url.length > best.length) {
					best = { section, title: item.title, length: item.url.length };
				}
			}
		}
		return best;
	});
</script>

<header
	class="bg-background/85 sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b backdrop-blur-md md:rounded-t-xl"
>
	<div class="flex w-full items-center gap-1 px-3 sm:px-4 lg:px-6">
		<Sidebar.Trigger class="text-muted-foreground -ms-1 h-11 w-11 md:h-8 md:w-8" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<p class="flex min-w-0 items-center gap-1.5 text-sm">
			{#if crumb?.section}
				<span class="text-muted-foreground hidden sm:inline">{crumb.section}</span>
				<span class="text-muted-foreground/60 hidden sm:inline" aria-hidden="true">/</span>
			{/if}
			<span class="truncate font-medium">{crumb?.title ?? 'Sheppakai Budget'}</span>
		</p>
		<div class="ms-auto flex items-center gap-2">
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
		</div>
	</div>
</header>
