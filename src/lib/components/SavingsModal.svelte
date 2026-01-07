<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			title?: string;
			description?: string | null;
			amount?: number;
		};
		isEditing?: boolean;
		isLoading?: boolean;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false)
	}: Props = $props();

	let id = $state('');
	let title = $state('');
	let description = $state('');
	let amount = $state('');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				title = initialData.title || '';
				description = initialData.description || '';
				amount = initialData.amount ? initialData.amount.toString() : '';
			} else {
				id = '';
				title = '';
				description = '';
				amount = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Savings' : 'Add New Savings'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this savings entry. Modify the title, description, or amount as needed.'
					: 'Create a new savings entry. Add a title, optional description, and the current amount.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/savings?/update' : '/savings?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing ? 'Savings updated successfully!' : 'Savings created successfully!'
						);
					} else {
						toast.error(`There was an error ${isEditing ? 'updating' : 'creating'} the savings entry.`);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
			<div class="space-y-2">
				<label for="savings-title" class="text-sm font-medium">Title</label>
				<Input
					id="savings-title"
					name="title"
					bind:value={title}
					placeholder="e.g., Emergency Fund, Vacation Savings"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="savings-description" class="text-sm font-medium">Description (Optional)</label>
				<Textarea
					id="savings-description"
					name="description"
					bind:value={description}
					placeholder="Add additional details about this savings account"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="savings-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="savings-amount"
					name="amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={amount}
					placeholder="0.00"
					required
				/>
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!title || !amount}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
