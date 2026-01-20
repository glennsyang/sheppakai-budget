<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { incomeSchema } from '$lib/formSchemas';
	import { extractDateFromTimestamp } from '$lib/utils/dates';

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
		incomeForm: SuperValidated<z.infer<typeof incomeSchema>>;
	}

	let {
		open = $bindable(),
		initialData = undefined,
		isEditing = false,
		isLoading = $bindable(false),
		incomeForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(incomeForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Income updated successfully!' : 'Income created successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'creating'} income. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				// Catastrophic DB crashes (Form data is lost)
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the income. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.name = initialData?.name || '';
				$form.description = initialData?.description || '';
				$form.date = initialData?.date ? extractDateFromTimestamp(initialData.date) : '';
				$form.amount = initialData?.amount || 0;
			} else {
				$form.id = '';
				$form.name = '';
				$form.description = '';
				$form.date = '';
				$form.amount = 0;
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
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
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="income-name" class="text-sm font-medium">Name</label>
				<Input
					id="income-name"
					name="name"
					bind:value={$form.name}
					placeholder="e.g., Monthly Salary, Freelance Project"
					class={$errors.name ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.name}
					<p class="text-sm text-red-500">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="income-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="income-description"
					name="description"
					bind:value={$form.description}
					placeholder="Additional details about this income"
					class={$errors.description ? 'border-red-400' : ''}
					rows={3}
					required
				/>
				{#if $errors.description}
					<p class="text-sm text-red-500">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="income-date" class="text-sm font-medium">Date</label>
				<Input
					id="income-date"
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
				<label for="income-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="income-amount"
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

			<Dialog.Footer class="pt-4">
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
