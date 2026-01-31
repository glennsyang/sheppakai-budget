<script lang="ts">
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { SidebarData, User } from '$lib/types';

	import NavMain from './NavMain.svelte';
	import NavReceipts from './NavReceipts.svelte';
	import NavSavings from './NavSavings.svelte';
	import NavSetup from './NavSetup.svelte';
	import NavUser from './NavUser.svelte';

	interface Props {
		sidebarData: SidebarData;
		user: User;
	}

	let { sidebarData, user, ...restProps }: Props = $props();
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:p-1.5!">
					{#snippet child({ props })}
						<a href="/" data-sveltekit-preload-data="hover" {...props}>
							<CircleDollarSignIcon class="size-5!" />
							<span class="text-base font-semibold">Sheppakai Budget</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={sidebarData.navMain} />
		<NavSavings items={sidebarData.navSavings} />
		<NavReceipts items={sidebarData.navReceipts} />
		<NavSetup items={sidebarData.navSetup} {user} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
