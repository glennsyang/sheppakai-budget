<script lang="ts">
	import { navigating, page } from '$app/state';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { setCategoriesContext } from '$lib/contexts';
	import { classifyNavigation } from '$lib/utils/navigation';

	import { sidebarData } from './sidebarData';

	import '../../app.css';

	let { data, children } = $props();

	// svelte-ignore state_referenced_locally
	setCategoriesContext(data.categories ?? []);

	// Only a genuine route change replaces the page. Same-route navigations
	// (month/year switches) keep the page mounted so it can skeleton in place.
	let isCrossRouteNavigation = $derived(
		classifyNavigation(navigating.to?.route.id, page.route.id) === 'cross-route'
	);
</script>

<Sidebar.Provider style="--header-height: calc(var(--spacing) * 12);">
	{#if data.user}
		<AppSidebar {sidebarData} user={data.user} />
		<Sidebar.Inset>
			<SiteHeader />
			<main class="flex flex-1 flex-col space-y-4 p-4 md:py-2">
				{#if isCrossRouteNavigation}
					<LoadingSpinner fullScreen={true} size="lg" />
				{:else}
					{@render children()}
				{/if}
			</main>
		</Sidebar.Inset>
	{/if}
</Sidebar.Provider>
