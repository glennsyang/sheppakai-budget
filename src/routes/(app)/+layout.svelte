<script lang="ts">
	import '../../app.css';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import ExpenseDialog from '$lib/components/ExpenseModal.svelte';
	import IncomeDialog from '$lib/components/IncomeModal.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import Menu from '@lucide/svelte/icons/menu';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import { toggleMode } from 'mode-watcher';
	import type { LayoutData } from '../$types';

	interface Props {
		data: LayoutData;
		children: any;
	}

	let { data, children }: Props = $props();

	let categoryDialogOpen = $state(false);
	let expenseDialogOpen = $state(false);
	let incomeDialogOpen = $state(false);

	function onCategoryAdded() {
		// You can add any logic here to refresh categories if needed
		console.log('Category added successfully');
	}

	function onExpenseAdded() {
		// Refresh dashboard data after adding expense
		console.log('Expense added successfully');
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('expense-added'));
		}
	}

	function onIncomeAdded() {
		// Refresh dashboard data after adding income
		console.log('Income added successfully');
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('income-added'));
		}
	}

	function openCategoryDialog() {
		categoryDialogOpen = true;
	}

	function openExpenseDialog() {
		expenseDialogOpen = true;
	}

	function openIncomeDialog() {
		incomeDialogOpen = true;
	}
</script>

<!-- Full application layout for all other routes -->
<div class="min-h-screen">
	<header class="shadow-lg">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-4">
					<h1 class="text-2xl font-bold">Budget Tracker</h1>
				</div>

				<div class="flex items-center space-x-4">
					{#if data.user}
						<span class="text-sm">Welcome, {data.user.firstName}</span>

						<!-- Dropdown Menu for Actions -->
						<DropdownMenu>
							<DropdownMenuTrigger>
								{#snippet child()}
									<Button variant="outline" size="sm" class="gap-2">
										Menu<Menu class="h-4 w-4" />
										<span class="sr-only">Open menu</span>
									</Button>
								{/snippet}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" class="w-56">
								<DropdownMenuItem onclick={openCategoryDialog}>
									<PlusIcon class="mr-2 h-4 w-4" />
									Add Category
								</DropdownMenuItem>
								<DropdownMenuItem onclick={openExpenseDialog}>
									<DollarSignIcon class="mr-2 h-4 w-4" />
									Add Expense
								</DropdownMenuItem>
								<DropdownMenuItem onclick={openIncomeDialog}>
									<TrendingUpIcon class="mr-2 h-4 w-4" />
									Add Income
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<form method="POST" action="/auth/sign-out" class="w-full">
										<Button type="submit" variant="ghost" size="sm" class="w-full justify-start">
											Sign Out
										</Button>
									</form>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
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
		{@render children()}
	</main>
</div>

<!-- Category Dialog -->
<CategoryDialog
	bind:open={categoryDialogOpen}
	onOpenChange={(open) => (categoryDialogOpen = open)}
	{onCategoryAdded}
/>

<!-- Expense Dialog -->
<ExpenseDialog bind:open={expenseDialogOpen} {onExpenseAdded} />

<!-- Income Dialog -->
<IncomeDialog bind:open={incomeDialogOpen} {onIncomeAdded} />
