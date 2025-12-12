<script lang="ts">
	import '../../app.css';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import House from '@lucide/svelte/icons/house';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import FolderTreeIcon from '@lucide/svelte/icons/folder-tree';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
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
</script>

<!-- Full application layout for all other routes -->
<div class="min-h-screen">
	<header class="border-b">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<!-- Left: Navigation Tabs -->
				<nav class="flex items-center space-x-1">
					<!-- Home Tab -->
					<NavigationMenu.Root viewport={false}>
						<NavigationMenu.List>
							<NavigationMenu.Item>
								<NavigationMenu.Link href="/dashboard" class="flex-row items-center gap-2"
									><House />Home</NavigationMenu.Link
								>
							</NavigationMenu.Item>

							<!-- Finances Tab with Dropdown -->
							<NavigationMenu.Item>
								<NavigationMenu.Trigger>Finances</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[200px] gap-4 p-2">
										<li>
											<NavigationMenu.Link
												href="/finances/transactions"
												class="flex-row items-center gap-2"
											>
												<ReceiptIcon />
												Transactions
											</NavigationMenu.Link>

											<NavigationMenu.Link
												href="/finances/budget"
												class="flex-row items-center gap-2"
											>
												<PiggyBankIcon />
												Budget
											</NavigationMenu.Link>

											<NavigationMenu.Link
												href="/finances/recurring"
												class="flex-row items-center gap-2"
											>
												<RepeatIcon />
												Recurring
											</NavigationMenu.Link>
										</li>
									</ul>
								</NavigationMenu.Content>
							</NavigationMenu.Item>

							<!-- Setup Tab -->
							<NavigationMenu.Item>
								<NavigationMenu.Trigger>Setup</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<ul class="grid w-[200px] gap-4 p-2">
										<li>
											<NavigationMenu.Link
												href="/setup/categories"
												class="flex-row items-center gap-2"
											>
												<FolderTreeIcon />
												Categories
											</NavigationMenu.Link>
											<NavigationMenu.Link href="/setup/income" class="flex-row items-center gap-2">
												<DollarSignIcon />
												Income
											</NavigationMenu.Link>
										</li>
									</ul>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
					</NavigationMenu.Root>
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
