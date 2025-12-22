<script lang="ts">
	import '../../app.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { navigating } from '$app/state';
	import { setContext } from 'svelte';
	import type { LayoutServerData } from './$types';
	import type { User } from '$lib/types';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { sidebarData } from './data';

	interface Props {
		data: LayoutServerData;
		children: any;
	}

	let { data, children }: Props = $props();

	setContext('categories', () => data.categories);
</script>

<Sidebar.Provider style="--header-height: calc(var(--spacing) * 12);">
	<AppSidebar {sidebarData} user={data.user as User} />
	<Sidebar.Inset>
		<SiteHeader />
		<main class="flex flex-1 flex-col space-y-4 p-4 md:py-2">
			{#if navigating.to}
				<LoadingSpinner fullScreen={true} size="lg" />
			{:else}
				{@render children()}
			{/if}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
