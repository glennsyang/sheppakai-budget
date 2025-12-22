<script lang="ts">
	import type { Icon } from '@lucide/svelte';
	import type { Component } from 'svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { items }: { items: { title: string; url: string; icon?: Component<Icon> }[] } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Setup</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent={item.title}>
					{#snippet child({ props })}
						{@const IconComponent = item.icon}
						<a href={item.url} {...props}>
							<IconComponent />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
