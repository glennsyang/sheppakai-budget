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
	import type { contributionSchema } from '$lib/formSchemas/savings';
	import { extractDateFromTimestamp, getTodayDate } from '$lib/utils/dates';

	import type { SavingsGoal } from '$lib';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			goalId?: string;
			amount?: number;
			date?: string;
			description?: string | null;
		};
		isEditing?: boolean;
		isLoading?: boolean;
		goals: SavingsGoal[];
		preselectedGoalId?: string;
		contributionForm: SuperValidated<z.infer<typeof contributionSchema>>;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		goals,
		preselectedGoalId,
		contributionForm
	}: Props = $props();

	let activeGoals = $derived(goals.filter((g) => g.status === 'active'));

	const formInstance = $derived(
		superForm(contributionForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Contribution updated successfully!' : 'Contribution added successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'adding'} contribution. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'adding'} the contribution. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.goalId = initialData.goalId || '';
				$form.amount = initialData.amount || 0;
				$form.date = initialData.date ? extractDateFromTimestamp(initialData.date) : '';
				$form.description = initialData.description || '';
			} else {
				$form.id = '';
				$form.goalId = preselectedGoalId || '';
				$form.amount = 0;
				$form.description = '';
				$form.date = getTodayDate();
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>
				{isEditing ? 'Edit Contribution' : 'Add Contribution'}
			</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this contribution to your savings goal.'
					: 'Record a new contribution towards your savings goal.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing
				? '/savings/goals?/updateContribution'
				: '/savings/goals?/createContribution'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="contribution-goal" class="text-sm font-medium">Savings Goal</label>
				<Select.Root type="single" name="goalId" bind:value={$form.goalId} required>
					<Select.Trigger class="w-full">
						{$form.goalId
							? activeGoals.find((g) => g.id === $form.goalId)?.name || 'Select a goal'
							: 'Select a goal'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label class="px-2 py-1 text-sm font-medium">Active Goals</Select.Label>
						{#each activeGoals as goal (goal.id)}
							<Select.Item value={goal.id} label={goal.name}>
								{goal.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				{#if $errors.goalId}
					<p class="text-sm text-destructive">{$errors.goalId}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="contribution-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="contribution-amount"
					name="amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={$form.amount}
					placeholder="0.00"
					required
				/>
				{#if $errors.amount}
					<p class="text-sm text-destructive">{$errors.amount}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="contribution-date" class="text-sm font-medium">Date</label>
				<Input id="contribution-date" name="date" type="date" bind:value={$form.date} required />
				{#if $errors.date}
					<p class="text-sm text-destructive">{$errors.date}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="contribution-description" class="text-sm font-medium"
					>Description (Optional)</label
				>
				<Textarea
					id="contribution-description"
					name="description"
					bind:value={$form.description}
					placeholder="Add a note about this contribution..."
					rows={2}
				/>
				{#if $errors.description}
					<p class="text-sm text-destructive">{$errors.description}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button
					type="submit"
					disabled={$submitting || !$form.goalId || !$form.amount || !$form.date}
				>
					{isEditing ? 'Save Changes' : 'Add Contribution'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
