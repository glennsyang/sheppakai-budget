<script lang="ts">
	import { SIGN_IN_ROUTE } from '$lib/auth-routes';
	import BrandMark from '$lib/components/BrandMark.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { Button } from '$lib/components/ui/button';

	const areas = [
		{
			name: 'Spending',
			text: 'Transactions, a budget for each category, and what is safe to spend today.'
		},
		{
			name: 'Bills and income',
			text: 'Recurring bills with what is still owed, and money coming in.'
		},
		{ name: 'Savings', text: 'Account balances and goals, with every contribution logged.' },
		{
			name: 'Side business',
			text: 'Window-cleaning customers and jobs, plus fuel and business receipts with GST.'
		}
	];
</script>

<svelte:head>
	<title>Sheppakai Budget</title>
</svelte:head>

<div class="bg-sidebar flex min-h-dvh flex-col">
	<header class="flex h-14 items-center justify-between px-4 sm:px-6">
		<BrandMark />
		<div class="flex items-center gap-1">
			<ThemeToggle />
			<Button href={SIGN_IN_ROUTE} variant="outline">Sign in</Button>
		</div>
	</header>

	<main class="flex flex-1 items-center px-4 py-12 sm:px-6">
		<div
			class="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center"
		>
			<div class="max-w-xl">
				<h1 class="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
					One household’s money and side business, in one ledger.
				</h1>
				<p class="text-muted-foreground mt-4 max-w-md text-base text-pretty">
					Log an expense in seconds on your phone, then sit down at the desk and see where the month
					went.
				</p>
				<Button href={SIGN_IN_ROUTE} size="lg" class="mt-8">Sign in</Button>
			</div>

			<dl class="bg-card divide-y rounded-xl border shadow-sm">
				{#each areas as area (area.name)}
					<div class="px-5 py-4">
						<dt class="text-sm font-medium">{area.name}</dt>
						<dd class="text-muted-foreground mt-0.5 text-sm">{area.text}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</main>
</div>
