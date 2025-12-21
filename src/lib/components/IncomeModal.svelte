<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			name?: string;
			description?: string;
			date?: string;
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
	let name = $state(initialData?.name || '');
	let description = $state(initialData?.description || '');
	let date = $state(initialData?.date || '');
	let amount = $state(initialData?.amount?.toString() || '');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				name = initialData?.name || '';
				description = initialData?.description || '';
				date = initialData?.date || '';
				amount = initialData?.amount?.toString() || '';
			} else {
				id = '';
				name = '';
				description = '';
				date = '';
				amount = '';
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
					? 'Update this income source. Modify the description and amount as needed.'
					: 'Create a new income source to track your earnings.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/finances/income?/update' : '/finances/income?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;
				toast.success(isEditing ? 'Income updated!' : 'Income created!', {
					description: `Income: ${description}`
				});

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(isEditing ? 'Income updated!' : 'Income created!', {
							description: `Income: ${description}`
						});
					} else {
						toast.error(`There was an error ${isEditing ? 'updating' : 'creating'} the income.`);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />

			<div class="space-y-2">
				<label for="income-name" class="text-sm font-medium">Name</label>
				<Input
					id="income-name"
					name="name"
					bind:value={name}
					placeholder="e.g., Monthly Salary, Freelance Project"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="income-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="income-description"
					name="description"
					bind:value={description}
					placeholder="Additional details about this income"
					rows={3}
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="income-date" class="text-sm font-medium">Date</label>
				<Input id="income-date" name="date" type="date" bind:value={date} required />
			</div>

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

			<Dialog.Footer class="pt-4">
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!name || !description || !date || !amount}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
