<script lang="ts">
	import type { BaseModalProps } from '$lib';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { recurringSchema } from '$lib/formSchemas/finances';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import z from 'zod';

	interface Props extends BaseModalProps<z.infer<typeof recurringSchema>> {
		recurringForm: SuperValidated<z.infer<typeof recurringSchema>>;
	}

	let {
		open = $bindable(),
		initialData = undefined,
		isEditing = false,
		recurringForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(recurringForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				// Read form.message, not $message: superforms clears the store on submit and only
				// repopulates it after onUpdate has run, so the store is always undefined here.
				if (form.message?.type === 'success') {
					open = false;
					toast.success(form.message.text);
				} else if (form.message?.type === 'error') {
					toast.error(form.message.text);
				}
			},
			onError: ({ result }) => {
				// Catastrophic DB crashes (Form data is lost)
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the recurring expense. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, submitting } = $derived(formInstance);

	const months = [
		{ value: '1', label: 'January' },
		{ value: '2', label: 'February' },
		{ value: '3', label: 'March' },
		{ value: '4', label: 'April' },
		{ value: '5', label: 'May' },
		{ value: '6', label: 'June' },
		{ value: '7', label: 'July' },
		{ value: '8', label: 'August' },
		{ value: '9', label: 'September' },
		{ value: '10', label: 'October' },
		{ value: '11', label: 'November' },
		{ value: '12', label: 'December' }
	];

	const dueMonthLabel = $derived(months.find((m) => m.value === String($form.dueMonth))?.label);

	// Reset form when modal opens
	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.merchant = initialData.merchant || '';
				$form.description = initialData.description || '';
				$form.cadence = initialData.cadence || 'Monthly';
				$form.amount = initialData?.amount || 0;
				$form.dueDay = initialData.dueDay ?? null;
				$form.dueMonth = initialData.dueMonth ?? null;
			} else {
				$form.id = '';
				$form.merchant = '';
				$form.description = '';
				$form.cadence = 'Monthly';
				$form.amount = 0;
				$form.dueDay = null;
				$form.dueMonth = null;
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
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
			action={isEditing ? '/recurring?/update' : '/recurring?/create'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="recurring-merchant" class="text-sm font-medium">Merchant</label>
				<Input
					id="recurring-merchant"
					name="merchant"
					bind:value={$form.merchant}
					placeholder="Where is this recurring expense charged?"
					class={$errors.merchant ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.merchant}
					<p class="text-sm text-red-500">{$errors.merchant}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="recurring-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="recurring-description"
					name="description"
					bind:value={$form.description}
					placeholder="What was this recurring expense for?"
					class={$errors.description ? 'border-red-400' : ''}
					rows={2}
					required
				/>
				{#if $errors.description}
					<p class="text-sm text-red-500">{$errors.description}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="recurring-cadence" class="text-sm font-medium">Cadence</label>
				<Select.Root type="single" name="cadence" bind:value={$form.cadence} required>
					<Select.Trigger class="w-full {$errors.cadence ? 'border-red-400' : ''}">
						{$form.cadence ? $form.cadence : 'Select a cadence'}
					</Select.Trigger>
					<Select.Content>
						<Select.Label class="px-2 py-1 text-sm font-medium">Cadence</Select.Label>
						<Select.Item value="Monthly">Monthly</Select.Item>
						<Select.Item value="Yearly">Yearly</Select.Item>
					</Select.Content>
				</Select.Root>
				{#if $errors.cadence}
					<p class="text-sm text-red-500">{$errors.cadence}</p>
				{/if}
			</div>

			<div class="flex gap-4">
				<div class="space-y-2 {$form.cadence === 'Yearly' ? 'w-1/2' : 'w-full'}">
					<label for="recurring-due-day" class="text-sm font-medium">Due day</label>
					<Input
						id="recurring-due-day"
						name="dueDay"
						type="number"
						min="1"
						max="31"
						bind:value={$form.dueDay}
						placeholder="e.g. 15"
						class={$errors.dueDay ? 'border-red-400' : ''}
					/>
					{#if $errors.dueDay}
						<p class="text-sm text-red-500">{$errors.dueDay}</p>
					{/if}
				</div>

				{#if $form.cadence === 'Yearly'}
					<div class="w-1/2 space-y-2">
						<label for="recurring-due-month" class="text-sm font-medium">Due month</label>
						<Select.Root
							type="single"
							name="dueMonth"
							value={String($form.dueMonth ?? '')}
							onValueChange={(value) => ($form.dueMonth = value ? Number(value) : null)}
						>
							<Select.Trigger class="w-full {$errors.dueMonth ? 'border-red-400' : ''}">
								{dueMonthLabel ? dueMonthLabel : 'Select a month'}
							</Select.Trigger>
							<Select.Content>
								<Select.Label class="px-2 py-1 text-sm font-medium">Due month</Select.Label>
								{#each months as month (month.value)}
									<Select.Item value={month.value}>{month.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#if $errors.dueMonth}
							<p class="text-sm text-red-500">{$errors.dueMonth}</p>
						{/if}
					</div>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="recurring-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="recurring-amount"
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
