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
	import type { savingsGoalSchema } from '$lib/formSchemas/savings';
	import { extractDateFromTimestamp } from '$lib/utils/dates';

	import type { BaseModalProps } from '$lib';

	interface Props extends BaseModalProps<z.infer<typeof savingsGoalSchema>> {
		savingsGoalForm: SuperValidated<z.infer<typeof savingsGoalSchema>>;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		savingsGoalForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(savingsGoalForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Savings goal updated successfully!' : 'Savings goal created successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'creating'} savings goal. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the savings goal. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	// Determine available status options based on current status
	const availableStatuses = $derived(() => {
		const baseStatuses = [
			{ value: 'active', label: 'Active' },
			{ value: 'completed', label: 'Completed' },
			{ value: 'paused', label: 'Paused' }
		];

		// Only show archived option if current status is completed
		if (initialData?.status === 'completed') {
			baseStatuses.push({ value: 'archived', label: 'Archived' });
		}

		return baseStatuses;
	});

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.name = initialData.name || '';
				$form.description = initialData.description || '';
				$form.targetAmount = initialData.targetAmount || 0;
				$form.targetDate = initialData.targetDate
					? extractDateFromTimestamp(initialData.targetDate)
					: '';
				$form.status = initialData.status || 'active';
			} else {
				$form.id = '';
				$form.name = '';
				$form.description = '';
				$form.targetAmount = 0;
				$form.targetDate = '';
				$form.status = 'active';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Savings Goal' : 'Create New Savings Goal'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update your savings goal details. Modify the name, target amount, or status as needed.'
					: "Set up a new savings goal. Define what you're saving for and how much you want to save."}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/savings/goals?/updateGoal' : '/savings/goals?/createGoal'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="goal-name" class="text-sm font-medium">Goal Name</label>
				<Input
					id="goal-name"
					name="name"
					bind:value={$form.name}
					placeholder="e.g., Dream Vacation to Bali"
					required
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="goal-description" class="text-sm font-medium">Description (Optional)</label>
				<Textarea
					id="goal-description"
					name="description"
					bind:value={$form.description}
					placeholder="Add details about your goal..."
					rows={2}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="goal-target-amount" class="text-sm font-medium">Target Amount</label>
				<Input
					id="goal-target-amount"
					name="targetAmount"
					type="number"
					step="0.01"
					min="0"
					bind:value={$form.targetAmount}
					placeholder="0.00"
					required
				/>
				{#if $errors.targetAmount}
					<p class="text-sm text-destructive">{$errors.targetAmount}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="goal-target-date" class="text-sm font-medium">Target Date (Optional)</label>
				<Input id="goal-target-date" name="targetDate" type="date" bind:value={$form.targetDate} />
				{#if $errors.targetDate}
					<p class="text-sm text-destructive">{$errors.targetDate}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="goal-status" class="text-sm font-medium">Status</label>
				<Select.Root type="single" name="status" bind:value={$form.status} required>
					<Select.Trigger class="w-full">
						{$form.status.charAt(0).toUpperCase() + $form.status.slice(1)}
					</Select.Trigger>
					<Select.Content>
						{#each availableStatuses() as status (status.value)}
							<Select.Item value={status.value} label={status.label}>{status.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.status}
					<p class="text-sm text-destructive">{$errors.status}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$submitting || !$form.name || !$form.targetAmount}>
					{isEditing ? 'Save Changes' : 'Create Goal'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
