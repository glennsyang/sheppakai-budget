<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onExpenseAdded?: () => void;
	}

	let { open = $bindable(), onOpenChange, onExpenseAdded }: Props = $props();

	let amount = $state('');
	let description = $state('');
	let date = $state('');
	let categoryId = $state('');
	let submitting = $state(false);
	let categories = $state<Array<{ id: number; name: string }>>([]);
	let loadingCategories = $state(false);

	let categoriesLoaded = $state(false);

	// Set default date to today
	function setDefaultDate() {
		const today = new Date();
		date = today.toISOString().split('T')[0];
	}

	async function loadCategories() {
		if (loadingCategories || categoriesLoaded) return; // Prevent multiple calls

		loadingCategories = true;
		try {
			const response = await fetch('/api/categories');
			if (response.ok) {
				const data = await response.json();
				categories = data || [];
				categoriesLoaded = true;
			}
		} catch (error) {
			console.error('Error loading categories:', error);
		} finally {
			loadingCategories = false;
		}
	}

	async function handleSubmit(event?: Event) {
		event?.preventDefault();

		const numAmount = parseFloat(amount);
		if (!numAmount || numAmount <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		if (!date) {
			alert('Please select a date');
			return;
		}

		if (!categoryId) {
			alert('Please select a category');
			return;
		}

		submitting = true;
		try {
			const response = await fetch('/api/expenses', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					amount: numAmount,
					description: description.trim() || undefined,
					date: date,
					categoryId: parseInt(categoryId) // Required field, no need to check for undefined
				})
			});

			if (response.ok) {
				// Reset form
				amount = '';
				description = '';
				setDefaultDate();
				categoryId = '';
				onOpenChange(false);

				// Notify parent component
				onExpenseAdded?.();
			} else {
				const errorData = await response.json();
				alert(errorData.error || 'Failed to create expense');
			}
		} catch (error) {
			console.error('Error creating expense:', error);
			alert('Failed to create expense');
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		setDefaultDate();
	});

	// Load categories when dialog opens if not already loaded
	$effect(() => {
		if (open && !categoriesLoaded && !loadingCategories) {
			loadCategories();
		}
	});
</script>

<Dialog {open} {onOpenChange}>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>Add New Expense</DialogTitle>
			<DialogDescription>
				Record a new expense. Fill in the amount, description, date, and optionally select a
				category.
			</DialogDescription>
		</DialogHeader>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="expense-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="expense-amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={amount}
					placeholder="0.00"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="expense-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="expense-description"
					bind:value={description}
					placeholder="What was this expense for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="expense-date" class="text-sm font-medium">Date</label>
				<Input id="expense-date" type="date" bind:value={date} required />
			</div>

			<div class="space-y-2">
				<label for="expense-category" class="text-sm font-medium">Category</label>
				{#if loadingCategories}
					<div class="text-sm text-muted-foreground">Loading categories...</div>
				{:else}
					<Select.Root type="single" name="expense-category" bind:value={categoryId} required>
						<Select.Trigger class="w-full">
							{categoryId
								? categories.find((c) => c.id.toString() === categoryId)?.name ||
									'Select a category'
								: 'Select a category'}
						</Select.Trigger>
						<Select.Content>
							<Select.Label class="px-2 py-1 text-sm font-medium">Categories</Select.Label>
							{#each categories as category (category.id)}
								<Select.Item value={category.id.toString()} label={category.name}>
									{category.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
			</div>
		</form>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button type="button" onclick={handleSubmit} disabled={submitting || !amount || !categoryId}>
				{submitting ? 'Creating...' : 'Create Expense'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
