<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	interface Props {
		open: boolean;
		onIncomeAdded?: () => void;
		onIncomeUpdated?: () => void;
		initialData?: {
			id?: string;
			amount?: number;
			description?: string;
			date?: string;
		};
		isEditing?: boolean;
	}

	let {
		open = $bindable(),
		onIncomeAdded,
		onIncomeUpdated,
		initialData = undefined,
		isEditing = false
	}: Props = $props();

	let amount = $state(initialData?.amount ? initialData.amount.toString() : '');
	let description = $state(initialData?.description || '');
	let date = $state(initialData?.date || '');
	let submitting = $state(false);

	// Set default date to today if not editing
	function setDefaultDate() {
		if (!initialData?.date) {
			const today = new Date();
			date = today.toISOString().split('T')[0];
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

		const payload = {
			amount: numAmount,
			description: description.trim() || undefined,
			date: date
		};

		submitting = true;
		try {
			let url = '/api/income';
			let method = 'POST';

			// If we're editing, use PUT request with the income ID
			if (isEditing && initialData?.id) {
				url = `/api/income/${initialData.id}`;
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
					// Notify parent component for creation
					onIncomeAdded?.();
				} else {
					// Notify parent component for update
					onIncomeUpdated?.();
				}
			} else {
				const errorData = await response.json();
				const action = isEditing ? 'update' : 'create';
				alert(errorData.error || `Failed to ${action} income entry`);
			}
		} catch (error) {
			console.error(`Error ${isEditing ? 'updating' : 'creating'} income:`, error);
			alert(`Failed to ${isEditing ? 'update' : 'create'} income entry`);
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		setDefaultDate();
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Income' : 'Add New Income'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this income entry. Modify the amount, description, or date as needed.'
					: 'Record a new income entry. Fill in the amount, description, and date.'}
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/income?/create" use:enhance class="space-y-4">
			<div class="space-y-2">
				<label for="income-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="income-amount"
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
				<label for="income-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="income-description"
					name="description"
					bind:value={description}
					placeholder="What was this income for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="income-date" class="text-sm font-medium">Date</label>
				<Input id="income-date" name="date" type="date" bind:value={date} required />
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="button" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={submitting || !amount || !description || !date}>
					{submitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
