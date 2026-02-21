<script lang="ts">
	import type { Component } from 'svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let {
		items
	}: {
		items: {
			title: string;
			url?: string;
			icon?: Component;
			items?: { title: string; url: string }[];
		}[];
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each items as item (item.title)}
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

					{#if item.items?.length}
						<Sidebar.MenuSub>
							{#each item.items as subItem (subItem.title)}
								<Sidebar.MenuSubItem>
									<Sidebar.MenuSubButton>
										{#snippet child({ props })}
											<a href={subItem.url} {...props}>{subItem.title}</a>
										{/snippet}
									</Sidebar.MenuSubButton>
								</Sidebar.MenuSubItem>
							{/each}
						</Sidebar.MenuSub>
					{/if}
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
