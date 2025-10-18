<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			merchant?: string;
			description?: string;
			cadence?: 'Monthly' | 'Yearly';
			amount?: number;
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
	let merchant = $state(initialData?.merchant || '');
	let description = $state(initialData?.description || '');
	let cadence = $state<'Monthly' | 'Yearly'>(initialData?.cadence || 'Monthly');
	let amount = $state(initialData?.amount ? initialData.amount.toString() : '');

	// Reset form when modal opens
	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				merchant = initialData.merchant || '';
				description = initialData.description || '';
				cadence = initialData.cadence || 'Monthly';
				amount = initialData.amount ? initialData.amount.toString() : '';
			} else {
				id = '';
				merchant = '';
				description = '';
				cadence = 'Monthly';
				amount = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title
				>{isEditing ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}</Dialog.Title
			>
			<Dialog.Description>
				{isEditing
					? 'Update this recurring expense entry. Modify the merchant, description, cadence, or amount as needed.'
					: 'Record a new recurring expense entry. Fill in the merchant, description, cadence, and amount.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/finances/recurring?/update' : '/finances/recurring?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;
				toast.success(
					isEditing
						? 'Recurring expense updated successfully!'
						: 'Recurring expense created successfully!'
				);

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing
								? 'Recurring expense updated successfully!'
								: 'Recurring expense created successfully!'
						);
					} else {
						toast.error(
							`There was an error ${isEditing ? 'updating' : 'creating'} the recurring expense.`
						);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
			<div class="space-y-2">
				<label for="recurring-merchant" class="text-sm font-medium">Merchant</label>
				<Input
					id="recurring-merchant"
					name="merchant"
					bind:value={merchant}
					placeholder="Where is this recurring expense charged?"
				/>
			</div>

			<div class="space-y-2">
				<label for="recurring-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="recurring-description"
					name="description"
					bind:value={description}
					placeholder="What was this recurring expense for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="recurring-cadence" class="text-sm font-medium">Cadence</label>
				<Select.Root type="single" name="cadence" bind:value={cadence} required>
					<Select.Trigger class="w-full">
						{cadence ? cadence : 'Select a cadence'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label class="px-2 py-1 text-sm font-medium">Cadence</Select.Label>
						<Select.Item value="Monthly">Monthly</Select.Item>
						<Select.Item value="Yearly">Yearly</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<label for="recurring-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="recurring-amount"
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
				<Button type="submit" disabled={!amount || !description || !cadence || !merchant}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
