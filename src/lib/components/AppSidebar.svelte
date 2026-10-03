<script lang="ts">
	import { page } from '$app/state';
	import type { SidebarData, User } from '$lib';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';

	import NavMain from './NavMain.svelte';
	import NavSecondary from './NavSecondary.svelte';
	import NavUser from './NavUser.svelte';

	interface Props {
		sidebarData: SidebarData;
		user: User;
	}

	let { sidebarData, user, ...restProps }: Props = $props();

	// Longest matching nav URL wins, so /window-cleaning/jobs doesn't also light up /window-cleaning.
	let activeUrl = $derived.by(() => {
		const path = page.url.pathname;
		const urls = [
			...sidebarData.navMain,
			...sidebarData.navSavings,
			...sidebarData.navReceipts,
			...sidebarData.navWindows,
			...sidebarData.navSetup
		]
			.map((item) => item.url)
			.filter((url): url is string => !!url && (path === url || path.startsWith(`${url}/`)));
		return urls.sort((a, b) => b.length - a.length)[0] ?? null;
	});
</script>

<Sidebar.Root collapsible="icon" variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:p-1.5!">
					{#snippet child({ props })}
						<a href="/" data-sveltekit-preload-data="hover" {...props}>
							<span
								class="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-md"
							>
								<CircleDollarSignIcon class="size-3.5!" />
							</span>
							<span class="text-[0.9375rem] font-semibold tracking-tight">Sheppakai Budget</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={sidebarData.navMain} {activeUrl} />
		<NavSecondary title="Savings" items={sidebarData.navSavings} {activeUrl} />
		<NavSecondary title="Receipts" items={sidebarData.navReceipts} {activeUrl} />
		<NavSecondary title="Window Cleaning" items={sidebarData.navWindows} {activeUrl} />
		<NavSecondary title="Setup" items={sidebarData.navSetup} {user} {activeUrl} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
