<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { enhance } from '$app/forms';
	import type { Category } from '$lib';
	import { months } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			amount?: number;
			year: string;
			month: string;
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
	let year = $state(initialData?.year || new Date().getFullYear().toString());
	let month = $state(initialData?.month || new Date().toLocaleString('default', { month: 'long' }));
	let categoryId = $state(initialData?.categoryId || '');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				amount = initialData.amount ? initialData.amount.toString() : '';
				year = initialData.year || new Date().getFullYear().toString();
				month = initialData.month || new Date().toLocaleString('default', { month: 'long' });
				categoryId = initialData.categoryId || '';
			} else {
				id = '';
				amount = '';
				year = new Date().getFullYear().toString();
				month = '';
				categoryId = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Budget' : 'Add New Budget'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this budget entry. Modify the amount, year, month, or category as needed.'
					: 'Record a new budget entry. Fill in the amount, year, month, and select a category.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/budget?/update' : '/budget?/create'}
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing ? 'Budget updated successfully!' : 'Budget created successfully!'
						);
					} else {
						toast.error(`There was an error ${isEditing ? 'updating' : 'creating'} the budget.`);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />

			<div class="space-y-2">
				<label for="budget-category" class="text-sm font-medium">Category</label>
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

			<input type="hidden" name="year" value={year} />

			<div class="space-y-2">
				<label for="budget-month" class="text-sm font-medium">Month</label>
				<Select.Root type="single" name="month" bind:value={month} required>
					<Select.Trigger class="w-full">
						{month ? months.find((m) => m.value === month)?.label : 'Select Month'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Select Month</Select.Label>
						{#each months as month (month.value)}
							<Select.Item value={month.value} label={month.label}>
								{`${month.value} - ${month.label}`}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<label for="budget-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="budget-amount"
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
				<Button type="submit" disabled={!amount || !year || !month || !categoryId}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
