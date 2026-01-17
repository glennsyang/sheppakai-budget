<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { utcTimestampToLocalDate } from '$lib/utils/dates';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			name?: string;
			description?: string | null;
			targetAmount?: number;
			targetDate?: string | null;
			status?: 'active' | 'completed' | 'paused';
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
	let name = $state('');
	let description = $state('');
	let targetAmount = $state('');
	let targetDate = $state('');
	let status = $state<'active' | 'completed' | 'paused'>('active');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				name = initialData.name || '';
				description = initialData.description || '';
				targetAmount = initialData.targetAmount ? initialData.targetAmount.toString() : '';
				// Convert UTC timestamp to local date for editing
				targetDate = initialData.targetDate ? utcTimestampToLocalDate(initialData.targetDate) : '';
				status = initialData.status || 'active';
			} else {
				id = '';
				name = '';
				description = '';
				targetAmount = '';
				targetDate = '';
				status = 'active';
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
			use:enhance={() => {
				open = false;
				isLoading = true;

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(
							isEditing
								? 'Savings goal updated successfully!'
								: 'Savings goal created successfully!'
						);
					} else {
						toast.error(
							`There was an error ${isEditing ? 'updating' : 'creating'} the savings goal.`
						);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />

			<div class="space-y-2">
				<label for="goal-name" class="text-sm font-medium">Goal Name</label>
				<Input
					id="goal-name"
					name="name"
					bind:value={name}
					placeholder="e.g., Dream Vacation to Bali"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="goal-description" class="text-sm font-medium">Description (Optional)</label>
				<Textarea
					id="goal-description"
					name="description"
					bind:value={description}
					placeholder="Add details about your goal..."
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="goal-target-amount" class="text-sm font-medium">Target Amount</label>
				<Input
					id="goal-target-amount"
					name="targetAmount"
					type="number"
					step="0.01"
					min="0"
					bind:value={targetAmount}
					placeholder="0.00"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="goal-target-date" class="text-sm font-medium">Target Date (Optional)</label>
				<Input id="goal-target-date" name="targetDate" type="date" bind:value={targetDate} />
			</div>

			<div class="space-y-2">
				<label for="goal-status" class="text-sm font-medium">Status</label>
				<Select.Root type="single" name="status" bind:value={status} required>
					<Select.Trigger class="w-full">
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="active" label="Active">Active</Select.Item>
						<Select.Item value="completed" label="Completed">Completed</Select.Item>
						<Select.Item value="paused" label="Paused">Paused</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!name || !targetAmount}>
					{isEditing ? 'Save Changes' : 'Create Goal'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
