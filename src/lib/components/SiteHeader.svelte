<script lang="ts">
	import { page } from '$app/state';
	import type { SidebarData } from '$lib';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	interface Props {
		sidebarData: SidebarData;
	}

	let { sidebarData }: Props = $props();

	// Section and page title from the nav: "Receipts / Fuel", or just "Dashboard".
	const sections: [string | null, { title: string; url?: string }[]][] = $derived([
		[null, sidebarData.navMain],
		['Savings', sidebarData.navSavings],
		['Receipts', sidebarData.navReceipts],
		['Window cleaning', sidebarData.navWindows],
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
		if (!best && (path === '/profile' || path.startsWith('/profile/'))) {
			return { section: null, title: 'Profile', length: 0 };
		}
		return best;
	});
</script>

<header
	class="bg-background/85 sticky top-0 z-20 flex h-[calc(var(--header-height)+env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md md:rounded-t-xl"
>
	<div class="flex w-full items-center gap-1 px-3 sm:px-4 lg:px-6">
		<Sidebar.Trigger class="text-muted-foreground -ms-1 hidden md:inline-flex md:h-8 md:w-8" />
		<Separator
			orientation="vertical"
			class="mx-2 hidden data-[orientation=vertical]:h-4 md:block"
		/>
		<p class="flex min-w-0 items-center gap-1.5 text-sm">
			{#if crumb?.section}
				<span class="text-muted-foreground hidden sm:inline">{crumb.section}</span>
				<span class="text-muted-foreground/60 hidden sm:inline" aria-hidden="true">/</span>
			{/if}
			<span class="truncate font-medium">{crumb?.title ?? 'Sheppakai Budget'}</span>
		</p>
		<div class="ms-auto flex items-center gap-2">
			<ThemeToggle />
		</div>
	</div>
</header>
