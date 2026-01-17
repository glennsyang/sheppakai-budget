<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
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
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		goals,
		preselectedGoalId
	}: Props = $props();

	let activeGoals = $derived(goals.filter((g) => g.status === 'active'));

	let id = $state('');
	let goalId = $state('');
	let amount = $state('');
	let date = $state('');
	let description = $state('');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				goalId = initialData.goalId || '';
				amount = initialData.amount ? initialData.amount.toString() : '';
				// Extract date portion from timestamp for editing
				date = initialData.date ? extractDateFromTimestamp(initialData.date) : '';
				description = initialData.description || '';
			} else {
				id = '';
				goalId = preselectedGoalId || '';
				amount = '';
				description = '';
				date = getTodayDate();
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
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing ? 'Contribution updated successfully!' : 'Contribution added successfully!'
						);
					} else {
						toast.error(
							`There was an error ${isEditing ? 'updating' : 'adding'} the contribution.`
						);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />

			<div class="space-y-2">
				<label for="contribution-goal" class="text-sm font-medium">Savings Goal</label>
				<Select.Root type="single" name="goalId" bind:value={goalId} required>
					<Select.Trigger class="w-full">
						{goalId
							? activeGoals.find((g) => g.id === goalId)?.name || 'Select a goal'
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
			</div>

			<div class="space-y-2">
				<label for="contribution-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="contribution-amount"
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
				<label for="contribution-date" class="text-sm font-medium">Date</label>
				<Input id="contribution-date" name="date" type="date" bind:value={date} required />
			</div>

			<div class="space-y-2">
				<label for="contribution-description" class="text-sm font-medium"
					>Description (Optional)</label
				>
				<Textarea
					id="contribution-description"
					name="description"
					bind:value={description}
					placeholder="Add a note about this contribution..."
					rows={2}
				/>
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!goalId || !amount || !date}>
					{isEditing ? 'Save Changes' : 'Add Contribution'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
