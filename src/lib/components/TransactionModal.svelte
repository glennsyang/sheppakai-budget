<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { transactionSchema } from '$lib/formSchemas';
	import { extractDateFromTimestamp, getTodayDate } from '$lib/utils/dates';

	import type { Category } from '$lib';

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
		transactionForm: SuperValidated<z.infer<typeof transactionSchema>>;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		categories,
		transactionForm
	}: Props = $props();

	let sortedCategories = $derived([...categories].sort((a, b) => a.name.localeCompare(b.name)));

	const formInstance = $derived(
		superForm(transactionForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Transaction updated successfully!' : 'Transaction created successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'creating'} transaction. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				// Catastrophic DB crashes (Form data is lost)
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the transaction. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.amount = initialData.amount || 0;
				$form.payee = initialData.payee || '';
				$form.notes = initialData.notes || '';
				$form.date = initialData.date ? extractDateFromTimestamp(initialData.date) : '';
				$form.categoryId = initialData.categoryId || '';
			} else {
				$form.id = '';
				$form.amount = 0;
				$form.payee = '';
				$form.notes = '';
				$form.categoryId = '';
				$form.date = getTodayDate();
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
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
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />
			<div class="space-y-2">
				<label for="transaction-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="transaction-amount"
					name="amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={$form.amount}
					placeholder="0.00"
					class={$errors.amount ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.amount}
					<p class="text-sm text-red-500">{$errors.amount}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="transaction-payee" class="text-sm font-medium">Payee</label>
				<Input
					id="transaction-payee"
					name="payee"
					bind:value={$form.payee}
					placeholder="Who did you pay?"
					class={$errors.payee ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.payee}
					<p class="text-sm text-red-500">{$errors.payee}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="transaction-notes" class="text-sm font-medium">Notes</label>
				<Textarea
					id="transaction-notes"
					name="notes"
					bind:value={$form.notes}
					placeholder="What was this transaction for?"
					class={$errors.notes ? 'border-red-400' : ''}
					rows={2}
				/>
				{#if $errors.notes}
					<p class="text-sm text-red-500">{$errors.notes}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="transaction-date" class="text-sm font-medium">Date</label>
				<Input
					id="transaction-date"
					name="date"
					type="date"
					bind:value={$form.date}
					class={$errors.date ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.date}
					<p class="text-sm text-red-500">{$errors.date}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="transaction-category" class="text-sm font-medium">Category</label>
				<Select.Root type="single" name="categoryId" bind:value={$form.categoryId} required>
					<Select.Trigger class="w-full {$errors.categoryId ? 'border-red-400' : ''}">
						{$form.categoryId
							? sortedCategories.find((c) => c.id === $form.categoryId)?.name || 'Select a category'
							: 'Select a category'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label class="px-2 py-1 text-sm font-medium">Categories</Select.Label>
						{#each sortedCategories as category (category.id)}
							<Select.Item value={category.id} label={category.name}>
								{category.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.categoryId}
					<p class="text-sm text-red-500">{$errors.categoryId}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
