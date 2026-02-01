<script lang="ts">
	import { navigating } from '$app/state';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { setCategoriesContext } from '$lib/contexts';

	import type { LayoutServerData } from './$types';
	import { sidebarData } from './data';

	import '../../app.css';

	interface Props {
		data: LayoutServerData;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		children: any;
	}

	let { data, children }: Props = $props();

	// svelte-ignore state_referenced_locally
	setCategoriesContext(data.categories ?? []);
</script>

<Sidebar.Provider style="--header-height: calc(var(--spacing) * 12);">
	{#if data.user}
		<AppSidebar {sidebarData} user={data.user} />
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
	{/if}
</Sidebar.Provider>
