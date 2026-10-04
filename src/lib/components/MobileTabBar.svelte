<script lang="ts">
	import { enhance } from '$app/forms';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { SidebarData, User } from '$lib';
	import { SIGN_OUT_ROUTE } from '$lib/auth-routes';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { matchNavUrl } from '$lib/utils/navigation';
	import BrushCleaningIcon from '@lucide/svelte/icons/brush-cleaning';
	import CircleUserIcon from '@lucide/svelte/icons/circle-user';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import HouseIcon from '@lucide/svelte/icons/house';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
	import ReceiptIcon from '@lucide/svelte/icons/receipt';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import type { Component } from 'svelte';

	interface Props {
		sidebarData: SidebarData;
		user: User;
	}

	let { sidebarData, user }: Props = $props();

	// Four destinations used most on a phone, then More. Labels stay one short word so
	// five tabs fit a 320px screen.
	const tabs: { label: string; url: string; icon: Component; owns: string[] }[] = [
		{ label: 'Home', url: '/dashboard', icon: HouseIcon, owns: ['/dashboard'] },
		{ label: 'Spending', url: '/transactions', icon: ReceiptIcon, owns: ['/transactions'] },
		{ label: 'Budget', url: '/budget', icon: PiggyBankIcon, owns: ['/budget'] },
		{
			label: 'Cleaning',
			url: '/window-cleaning',
			icon: BrushCleaningIcon,
			owns: ['/window-cleaning', '/window-cleaning/jobs']
		}
	];

	let moreSections = $derived(
		(
			[
				['Money', sidebarData.navMain],
				['Savings', sidebarData.navSavings],
				['Receipts', sidebarData.navReceipts],
				['Window cleaning', sidebarData.navWindows],
				['Setup', sidebarData.navSetup]
			] as const
		)
			.map(([title, items]) => ({
				title,
				items: (items as SidebarData['navSetup']).filter(
					(item) =>
						!!item.url &&
						!['/dashboard', '/transactions', '/budget', '/window-cleaning'].includes(item.url) &&
						(!item.visible || item.visible(user.role ?? ''))
				)
			}))
			.filter((section) => section.items.length > 0)
	);

	let allUrls = $derived(
		[
			...sidebarData.navMain,
			...sidebarData.navSavings,
			...sidebarData.navReceipts,
			...sidebarData.navWindows,
			...sidebarData.navSetup
		]
			.map((item) => item.url)
			.concat('/profile')
	);
	let activeUrl = $derived(matchNavUrl(page.url.pathname, allUrls));
	let activeTab = $derived(
		tabs.find((tab) => tab.owns.some((url) => activeUrl === url))?.url ?? 'more'
	);

	let moreOpen = $state(false);
	afterNavigate(() => (moreOpen = false));
</script>

<nav
	aria-label="Sections"
	class="bg-background/90 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
>
	<ul class="mx-auto grid h-16 max-w-md grid-cols-5">
		{#each tabs as tab (tab.url)}
			{@const active = activeTab === tab.url}
			<li>
				<a
					href={tab.url}
					aria-current={active ? 'page' : undefined}
					class={[
						'tab focus-visible:ring-ring/50 flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] leading-none outline-none focus-visible:ring-[3px] focus-visible:ring-inset',
						active ? 'text-primary font-medium' : 'text-muted-foreground'
					]}
				>
					<span
						class={[
							'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150',
							active && 'bg-accent'
						]}
					>
						<tab.icon class="size-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
					</span>
					{tab.label}
				</a>
			</li>
		{/each}
		<li>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={moreOpen}
				aria-current={activeTab === 'more' ? 'page' : undefined}
				onclick={() => (moreOpen = true)}
				class={[
					'focus-visible:ring-ring/50 flex h-full w-full flex-col items-center justify-center gap-1 text-[0.6875rem] leading-none outline-none focus-visible:ring-[3px] focus-visible:ring-inset',
					activeTab === 'more' ? 'text-primary font-medium' : 'text-muted-foreground'
				]}
			>
				<span
					class={[
						'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-150',
						activeTab === 'more' && 'bg-accent'
					]}
				>
					<EllipsisIcon class="size-5" aria-hidden="true" />
				</span>
				More
			</button>
		</li>
	</ul>
</nav>

<Sheet.Root bind:open={moreOpen}>
	<Sheet.Content
		side="bottom"
		class="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
	>
		<Sheet.Header class="pb-2">
			<Sheet.Title class="tracking-tight">More</Sheet.Title>
			<Sheet.Description class="sr-only">Every other section of the app</Sheet.Description>
		</Sheet.Header>

		{#each moreSections as section (section.title)}
			<section class="px-2 pb-2">
				<h3 class="text-muted-foreground px-2 pt-2 pb-1 text-xs">{section.title}</h3>
				<ul class="grid grid-cols-2 gap-1">
					{#each section.items as item (item.url)}
						{@const active = activeUrl === item.url}
						<li>
							<a
								href={item.url}
								aria-current={active ? 'page' : undefined}
								class={[
									'focus-visible:ring-ring/50 flex h-12 items-center gap-3 rounded-[10px] px-3 text-sm outline-none focus-visible:ring-[3px]',
									active ? 'bg-accent text-accent-foreground font-medium' : 'active:bg-muted'
								]}
							>
								{#if item.icon}
									<item.icon
										class={['size-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground']}
										aria-hidden="true"
									/>
								{/if}
								<span class="truncate">{item.title}</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<section class="mx-2 mt-1 border-t px-0 pt-2">
			<h3 class="text-muted-foreground px-2 pt-1 pb-1 text-xs">Account</h3>
			<ul class="grid grid-cols-2 gap-1">
				<li>
					<a
						href="/profile"
						aria-current={activeUrl === '/profile' ? 'page' : undefined}
						class={[
							'focus-visible:ring-ring/50 flex h-12 items-center gap-3 rounded-[10px] px-3 text-sm outline-none focus-visible:ring-[3px]',
							activeUrl === '/profile'
								? 'bg-accent text-accent-foreground font-medium'
								: 'active:bg-muted'
						]}
					>
						<CircleUserIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
						<span class="truncate">{user.name || 'Profile'}</span>
					</a>
				</li>
				<li>
					<button
						type="button"
						onclick={toggleMode}
						class="focus-visible:ring-ring/50 active:bg-muted flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-sm outline-none focus-visible:ring-[3px]"
					>
						<SunIcon class="text-muted-foreground size-4 shrink-0 dark:hidden" aria-hidden="true" />
						<MoonIcon
							class="text-muted-foreground hidden size-4 shrink-0 dark:block"
							aria-hidden="true"
						/>
						<span class="dark:hidden">Dark mode</span>
						<span class="hidden dark:inline">Light mode</span>
					</button>
				</li>
				<li class="col-span-2">
					<form method="POST" action={SIGN_OUT_ROUTE} use:enhance>
						<button
							type="submit"
							class="focus-visible:ring-ring/50 active:bg-muted flex h-12 w-full items-center gap-3 rounded-[10px] px-3 text-sm outline-none focus-visible:ring-[3px]"
						>
							<LogOutIcon class="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
							Sign out
						</button>
					</form>
				</li>
			</ul>
		</section>
	</Sheet.Content>
</Sheet.Root>
