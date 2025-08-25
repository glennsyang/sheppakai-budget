<script lang="ts">
	import '../../app.css';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import Menu from '@lucide/svelte/icons/menu';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import UserIcon from '@lucide/svelte/icons/user';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import BankNoteIcon from '@lucide/svelte/icons/banknote';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import { toggleMode } from 'mode-watcher';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import { setContext } from 'svelte';
	import type { LayoutData } from '../$types';

	interface Props {
		data: LayoutData;
		children: any;
	}

	let { data, children }: Props = $props();

	let openCategoryModal = $state(false);

	setContext('categories', () => data.categories);
</script>

<!-- Full application layout for all other routes -->
<div class="min-h-screen">
	<header class="shadow-lg">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<Button href="/dashboard" class="text-2xl font-bold" variant="link">
						Budget Tracker
					</Button>
				</div>

				<div class="flex items-center space-x-4">
					{#if data.user}
						<span class="text-sm">Welcome, {data.user.firstName}</span>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								>{#snippet child({ props })}
									<Button {...props} variant="outline">
										<Avatar.Root>
											<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
											<Avatar.Fallback>CN</Avatar.Fallback>
										</Avatar.Root>
										<Menu class="h-4 w-4" />
									</Button>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end" class="w-56">
								<DropdownMenu.Group>
									<DropdownMenu.Item onclick={() => goto('/profile')}>
										<UserIcon class="mr-2 h-4 w-4" />
										Profile
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/budget')}>
										<DollarSignIcon class="mr-2 h-4 w-4" />
										Budgets
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/expense')}>
										<ReceiptIcon class="mr-2 h-4 w-4" />
										Expenses
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => goto('/income')}>
										<BankNoteIcon class="mr-2 h-4 w-4" />
										Income
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => (openCategoryModal = true)}>
										<PlusIcon class="mr-2 h-4 w-4" />
										Category
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item>
										<form method="POST" action="/auth/sign-out" class="w-full">
											<Button type="submit" variant="ghost" size="sm" class="w-full justify-start">
												Sign Out
											</Button>
										</form>
									</DropdownMenu.Item>
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
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

<CategoryDialog bind:open={openCategoryModal} />
