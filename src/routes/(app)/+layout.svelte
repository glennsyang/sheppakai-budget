<script lang="ts">
	import '../../app.css';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { toggleMode } from 'mode-watcher';
	import { navigating, page } from '$app/state';
	import { setContext } from 'svelte';
	import type { LayoutServerData } from './$types';

	interface Props {
		data: LayoutServerData;
		children: any;
	}

	let { data, children }: Props = $props();

	if (data.categories) {
		setContext('categories', () => data.categories);
	}

	// Track active tab based on current path
	let currentPath = $derived(page.url.pathname);
	let isFinancesActive = $derived(
		currentPath.includes('/finances') ||
			currentPath.includes('/budget') ||
			currentPath.includes('/expense') ||
			currentPath.includes('/income')
	);
	let isHomeActive = $derived(
		currentPath === '/(app)/dashboard' || currentPath.startsWith('/dashboard')
	);
	let isSetupActive = $derived(currentPath === '/(app)/setup' || currentPath.startsWith('/setup'));
</script>

<!-- Full application layout for all other routes -->
<div class="min-h-screen">
	<header class="border-b">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Left: Navigation Tabs -->
				<nav class="flex items-center space-x-1">
					<!-- Home Tab -->
					<Button
						href="/dashboard"
						variant={isHomeActive ? 'secondary' : 'ghost'}
						class="px-4 py-2"
					>
						Home
					</Button>

					<!-- Finances Tab with Dropdown -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant={isFinancesActive ? 'secondary' : 'ghost'}
									class="px-4 py-2"
								>
									Finances
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="start">
							<DropdownMenu.Item onclick={() => (window.location.href = '/finances/transactions')}>
								Transactions
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => (window.location.href = '/finances/budget')}>
								Budget
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => (window.location.href = '/finances/recurring')}>
								Recurring
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<!-- Setup Tab -->
					<Button href="/setup" variant={isSetupActive ? 'secondary' : 'ghost'} class="px-4 py-2">
						Setup
					</Button>
				</nav>

				<!-- Right: Profile, Logout, Theme Toggle -->
				<div class="flex items-center space-x-2">
					{#if data.user}
						<!-- Profile Avatar -->
						<Button href="/profile" variant="ghost" size="icon" class="rounded-full">
							<Avatar.Root class="h-8 w-8">
								<Avatar.Fallback>
									{data.user?.firstName?.[0] || ''}{data.user?.lastName?.[0] || ''}
								</Avatar.Fallback>
							</Avatar.Root>
						</Button>

						<!-- Logout Button -->
						<form method="POST" action="/auth/sign-out">
							<Button type="submit" variant="ghost" size="sm">
								<LogOutIcon class="mr-2 h-4 w-4" />
								Logout
							</Button>
						</form>
					{/if}

					<!-- Theme Toggle -->
					<Button onclick={toggleMode} variant="outline" size="icon">
						<SunIcon
							class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
						/>
						<MoonIcon
							class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
						/>
						<span class="sr-only">Toggle theme</span>
					</Button>
				</div>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		{#if navigating.to}
			<LoadingSpinner fullScreen={true} size="lg" />
		{:else}
			{@render children()}
		{/if}
	</main>
</div>
