<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import type { Category } from '$lib/types';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			amount?: number;
			description?: string;
			date?: string;
		};
		isEditing?: boolean;
		isLoading?: boolean;
	}

	let {
		open = $bindable(),
		initialData = undefined,
		isEditing = false,
		isLoading = $bindable(false)
	}: Props = $props();

	let id = $state(initialData?.id || '');
	let amount = $state(initialData?.amount ? initialData.amount.toString() : '');
	let description = $state(initialData?.description || '');
	let date = $state(initialData?.date || '');

	// Set default date to today if not editing
	function setDefaultDate() {
		if (!initialData?.date) {
			const today = new Date();
			date = today.toISOString().split('T')[0];
		}
	}

	// Reset form when modal opens
	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				amount = initialData.amount ? initialData.amount.toString() : '';
				description = initialData.description || '';
				date = initialData.date || '';
			} else {
				id = '';
				amount = '';
				description = '';
				setDefaultDate();
			}
		}
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
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/income?/update' : '/income?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ update }) => {
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
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
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!amount || !description || !date}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
