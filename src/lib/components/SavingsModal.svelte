<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { savingsSchema } from '$lib/formSchemas';

	import type { BaseModalProps, Savings } from '$lib';

	interface Props extends BaseModalProps<z.infer<typeof savingsSchema>> {
		savingsForm: SuperValidated<z.infer<typeof savingsSchema>>;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		savingsForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(savingsForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Savings updated successfully!' : 'Savings created successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'creating'} savings. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				// Catastrophic DB crashes (Form data is lost)
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the savings entry. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.title = initialData.title || '';
				$form.description = initialData.description || '';
				$form.amount = initialData.amount || 0;
			} else {
				$form.id = '';
				$form.title = '';
				$form.description = '';
				$form.amount = 0;
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
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />
			<div class="space-y-2">
				<label for="savings-title" class="text-sm font-medium">Title</label>
				<Input
					id="savings-title"
					name="title"
					bind:value={$form.title}
					placeholder="e.g., Emergency Fund, Vacation Savings"
					class={$errors.title ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.title}
					<p class="text-sm text-red-500">{$errors.title}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="savings-description" class="text-sm font-medium">Description (Optional)</label>
				<Textarea
					id="savings-description"
					name="description"
					bind:value={$form.description}
					placeholder="Add additional details about this savings account"
					class={$errors.description ? 'border-red-400' : ''}
					rows={2}
				/>
				{#if $errors.description}
					<p class="text-sm text-red-500">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="savings-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="savings-amount"
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

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
