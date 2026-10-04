<script lang="ts">
	import { page } from '$app/state';
	import PageShell from '$lib/components/PageShell.svelte';

	let { children } = $props();

	const tabs = [
		{ href: '/admin/users', label: 'Users' },
		{ href: '/admin/archived-goals', label: 'Archived goals' },
		{ href: '/admin/deleted-customers', label: 'Deleted customers' },
		{ href: '/admin/api-keys', label: 'API keys' },
		{ href: '/admin/api-logs', label: 'API logs' }
	];

	const currentPath = $derived(page.url.pathname);
</script>

<PageShell title="Admin" subtitle="Accounts, API access and recovery">
	<nav aria-label="Admin sections">
		<ul class="bg-muted inline-flex flex-wrap items-center gap-0.5 rounded-lg p-[3px]">
			{#each tabs as tab (tab.href)}
				{@const active = currentPath === tab.href}
				<li class="h-10 md:h-[30px]">
					<a
						href={tab.href}
						aria-current={active ? 'page' : undefined}
						class={[
							'focus-visible:ring-ring/50 flex h-full items-center rounded-[10px] px-3 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px]',
							active
								? 'bg-background text-foreground font-medium shadow-xs'
								: 'text-muted-foreground hover:text-foreground'
						]}
					>
						{tab.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	{@render children()}
</PageShell>
