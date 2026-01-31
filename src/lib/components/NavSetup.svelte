<script lang="ts">
	import type { Icon } from '@lucide/svelte';
	import type { Component } from 'svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { User } from '$lib/types';

	let {
		items,
		user
	}: {
		items: {
			title: string;
			url: string;
			icon?: Component<Icon>;
			visible?: (role: string) => boolean;
		}[];
		user: User;
	} = $props();

	const visibleItems = $derived(
		items.filter((item) => !item.visible || item.visible(user.role ?? ''))
	);
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Setup</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each visibleItems as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent={item.title}>
					{#snippet child({ props })}
						{@const IconComponent = item.icon}
						<a href={item.url} data-sveltekit-preload-data="hover" {...props}>
							<IconComponent />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
