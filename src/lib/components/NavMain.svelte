<script lang="ts">
	import type { Icon } from '@lucide/svelte';
	import type { Component } from 'svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let {
		items
	}: {
		items: {
			title: string;
			url?: string;
			icon?: Component<Icon>;
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
							<a href={item.url} {...props}>
								{item.title}
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
