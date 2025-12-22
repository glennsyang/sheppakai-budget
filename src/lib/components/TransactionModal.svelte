<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import type { Category } from '$lib';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			amount?: number;
			payee?: string;
			notes?: string;
			date?: string;
			categoryId?: string;
		};
		isEditing?: boolean;
		isLoading?: boolean;
		categories: Category[];
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		categories
	}: Props = $props();

	let id = $state(initialData?.id || '');
	let amount = $state(initialData?.amount ? initialData.amount.toString() : '');
	let payee = $state(initialData?.payee || '');
	let notes = $state(initialData?.notes || '');
	let date = $state(initialData?.date || '');
	let categoryId = $state(initialData?.categoryId || '');

	// Set default date to today
	function setDefaultDate() {
		if (!initialData?.date) {
			const today = new Date();
			date = today.toISOString().split('T')[0];
		}
	}

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				amount = initialData.amount ? initialData.amount.toString() : '';
				payee = initialData.payee || '';
				notes = initialData.notes || '';
				date = initialData.date || '';
				categoryId = initialData.categoryId || '';
			} else {
				id = '';
				amount = '';
				payee = '';
				notes = '';
				categoryId = '';
				setDefaultDate();
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this transaction entry. Modify the amount, payee, notes, date, or category as needed.'
					: 'Record a new transaction entry. Fill in the amount, payee, notes, date, and optionally select a category.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/finances/transactions?/update' : '/finances/transactions?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing ? 'Transaction updated successfully!' : 'Transaction created successfully!'
						);
					} else {
						toast.error(
							`There was an error ${isEditing ? 'updating' : 'creating'} the transaction.`
						);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
			<div class="space-y-2">
				<label for="transaction-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="transaction-amount"
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
				<label for="transaction-payee" class="text-sm font-medium">Payee</label>
				<Input
					id="transaction-payee"
					name="payee"
					bind:value={payee}
					placeholder="Who did you pay?"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="transaction-notes" class="text-sm font-medium">Notes</label>
				<Textarea
					id="transaction-notes"
					name="notes"
					bind:value={notes}
					placeholder="What was this transaction for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="transaction-date" class="text-sm font-medium">Date</label>
				<Input id="transaction-date" name="date" type="date" bind:value={date} required />
			</div>

			<div class="space-y-2">
				<label for="transaction-category" class="text-sm font-medium">Category</label>
				<Select.Root type="single" name="categoryId" bind:value={categoryId} required>
					<Select.Trigger class="w-full">
						{categoryId
							? categories.find((c) => c.id === categoryId)?.name || 'Select a category'
							: 'Select a category'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label class="px-2 py-1 text-sm font-medium">Categories</Select.Label>
						{#each categories as category (category.id)}
							<Select.Item value={category.id} label={category.name}>
								{category.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!amount || !payee || !notes || !date || !categoryId}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
