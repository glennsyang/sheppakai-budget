<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		onExpenseAdded?: () => void;
		onExpenseUpdated?: () => void;
		initialData?: {
			id?: string;
			amount?: number;
			description?: string;
			date?: string;
			categoryId?: string;
		};
		isEditing?: boolean;
	}

	let {
		open = $bindable(),
		onExpenseAdded,
		onExpenseUpdated,
		initialData,
		isEditing
	}: Props = $props();

	let amount = $state(initialData?.amount ? initialData.amount.toString() : '');
	let description = $state(initialData?.description || '');
	let date = $state(initialData?.date || '');
	let categoryId = $state(initialData?.categoryId || '');
	let categories = $state<Array<{ id: string; name: string }>>([]);
	let loadingCategories = $state(false);
	let submitting = $state(false);

	let categoriesLoaded = $state(false);

	// Set default date to today
	function setDefaultDate() {
		if (!initialData?.date) {
			const today = new Date();
			date = today.toISOString().split('T')[0];
		}
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

		const payload = {
			amount: numAmount,
			description: description.trim() || undefined,
			date: date,
			categoryId: parseInt(categoryId.toString()) // Required field, no need to check for undefined
		};

		submitting = true;
		try {
			let url = '/api/expenses';
			let method = 'POST';

			if (isEditing && initialData?.id) {
				url = `/api/expenses/${initialData.id}`;
				method = 'PUT';
			}
			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (response.ok) {
				// Reset form
				if (!isEditing) {
					amount = '';
					description = '';
					setDefaultDate();
					categoryId = '';
					onExpenseAdded?.();
				} else {
					onExpenseUpdated?.();
				}
			} else {
				const errorData = await response.json();
				const action = isEditing ? 'update' : 'create';
				alert(errorData.error || `Failed to ${action} expense`);
			}
		} catch (error) {
			console.error(`Error ${isEditing ? 'updating' : 'creating'} expense:`, error);
			alert(`Failed to ${isEditing ? 'update' : 'create'} expense entry`);
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

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Expense' : 'Add New Expense'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this expense entry. Modify the amount, description, date, or category as needed.'
					: 'Record a new expense entry. Fill in the amount, description, date, and optionally select a category.'}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/expenses?/create" class="space-y-4">
			<div class="space-y-2">
				<label for="expense-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="expense-amount"
					name="amount"
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
					name="description"
					bind:value={description}
					placeholder="What was this expense for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="expense-date" class="text-sm font-medium">Date</label>
				<Input id="expense-date" name="date" type="date" bind:value={date} required />
			</div>

			<div class="space-y-2">
				<label for="expense-category" class="text-sm font-medium">Category</label>
				{#if loadingCategories}
					<div class="text-sm text-muted-foreground">Loading categories...</div>
				{:else}
					<Select.Root type="single" name="categoryId" bind:value={categoryId} required>
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

			<Dialog.Footer>
				<Dialog.Close>
					<Button type="button" variant="outline">Cancel</Button>
				</Dialog.Close>
				<Button
					type="submit"
					disabled={submitting || !amount || !description || !date || !categoryId}
				>
					{submitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
