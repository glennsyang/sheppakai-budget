<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';

	let { children } = $props();

	const currentPath = $derived(page.url.pathname);
</script>

<div class="container mx-auto space-y-6 py-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
			<p class="text-muted-foreground">Manage users and everything else</p>
		</div>
	</div>

	<div class="flex gap-2 overflow-x-auto border-b">
		<a href="/admin/users" class="shrink-0">
			<Button variant={currentPath === '/admin/users' ? 'default' : 'ghost'} class="rounded-b-none">
				Users
			</Button>
		</a>
		<a href="/admin/archived-goals" class="shrink-0">
			<Button
				variant={currentPath === '/admin/archived-goals' ? 'default' : 'ghost'}
				class="rounded-b-none"
			>
				Archived Goals
			</Button>
		</a>
		<a href="/admin/deleted-customers" class="shrink-0">
			<Button
				variant={currentPath === '/admin/deleted-customers' ? 'default' : 'ghost'}
				class="rounded-b-none"
			>
				Deleted Customers
			</Button>
		</a>
		<a href="/admin/api-keys" class="shrink-0">
			<Button
				variant={currentPath === '/admin/api-keys' ? 'default' : 'ghost'}
				class="rounded-b-none"
			>
				API Keys
			</Button>
		</a>
		<a href="/admin/api-logs" class="shrink-0">
			<Button
				variant={currentPath === '/admin/api-logs' ? 'default' : 'ghost'}
				class="rounded-b-none"
			>
				API Logs
			</Button>
		</a>
	</div>

	{@render children()}
</div>
