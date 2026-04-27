<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { windowCleaningJobSchema } from '$lib/formSchemas/windowCleaning';
	import { getTodayDate } from '$lib/utils/dates';

	import type { BaseModalProps, WindowCleaningJob } from '$lib';

	interface Props extends BaseModalProps<WindowCleaningJob> {
		jobForm: SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
		preselectedCustomerId?: string;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		jobForm,
		preselectedCustomerId
	}: Props = $props();

	const formInstance = $derived(
		superForm(jobForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(isEditing ? 'Job updated successfully!' : 'Job logged successfully!');
				}
				if ($message?.type === 'error') {
					toast.error(`Error ${isEditing ? 'updating' : 'logging'} job. Reason: ${$message.text}`);
				}
			},
			onError: ({ result }) => {
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'logging'} the job. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.customerId = initialData.customerId || preselectedCustomerId || '';
				$form.jobDate = initialData.jobDate || getTodayDate();
				$form.jobTime = initialData.jobTime || '';
				$form.amountCharged = initialData.amountCharged ?? 0;
				$form.tip = initialData.tip ?? 0;
				$form.durationHours = initialData.durationHours ?? undefined;
				$form.notes = initialData.notes || '';
			} else {
				$form.id = '';
				$form.customerId = preselectedCustomerId || '';
				$form.jobDate = getTodayDate();
				$form.jobTime = '';
				$form.amountCharged = 0;
				$form.tip = 0;
				$form.durationHours = undefined;
				$form.notes = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				{isEditing ? 'Edit Job' : 'Log Job'}
			</Dialog.Title>
			<Dialog.Description>
				{isEditing ? 'Update this job record.' : 'Record a completed window cleaning job.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/window-cleaning?/updateJob' : '/window-cleaning?/createJob'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />
			<input type="hidden" name="customerId" bind:value={$form.customerId} />

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="job-date" class="text-sm font-medium"
						>Date <span class="text-destructive">*</span></label
					>
					<Input id="job-date" name="jobDate" type="date" bind:value={$form.jobDate} required />
					{#if $errors.jobDate}
						<p class="text-sm text-destructive">{$errors.jobDate}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="job-time" class="text-sm font-medium"
						>Time <span class="text-xs text-muted-foreground">(optional)</span></label
					>
					<Input id="job-time" name="jobTime" type="time" bind:value={$form.jobTime} />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="job-charged" class="text-sm font-medium"
						>Charged ($) <span class="text-destructive">*</span></label
					>
					<Input
						id="job-charged"
						name="amountCharged"
						type="number"
						step="0.01"
						min="0.01"
						bind:value={$form.amountCharged}
						placeholder="0.00"
						required
					/>
					{#if $errors.amountCharged}
						<p class="text-sm text-destructive">{$errors.amountCharged}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="job-tip" class="text-sm font-medium"
						>Tip ($) <span class="text-xs text-muted-foreground">(optional)</span></label
					>
					<Input
						id="job-tip"
						name="tip"
						type="number"
						step="0.01"
						min="0"
						bind:value={$form.tip}
						placeholder="0.00"
					/>
					{#if $errors.tip}
						<p class="text-sm text-destructive">{$errors.tip}</p>
					{/if}
				</div>
			</div>

			<div class="space-y-2">
				<label for="job-duration" class="text-sm font-medium"
					>Duration (hrs) <span class="text-xs text-muted-foreground">(optional, e.g. 1.5)</span
					></label
				>
				<Input
					id="job-duration"
					name="durationHours"
					type="number"
					step="0.25"
					min="0.25"
					bind:value={$form.durationHours}
					placeholder="1.5"
				/>
				{#if $errors.durationHours}
					<p class="text-sm text-destructive">{$errors.durationHours}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="job-notes" class="text-sm font-medium"
					>Notes <span class="text-xs text-muted-foreground">(optional)</span></label
				>
				<Textarea
					id="job-notes"
					name="notes"
					bind:value={$form.notes}
					placeholder="Any notes about this job..."
					rows={2}
				/>
				{#if $errors.notes}
					<p class="text-sm text-destructive">{$errors.notes}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button
					type="submit"
					disabled={$submitting || isLoading || !$form.jobDate || !$form.amountCharged}
				>
					{isEditing ? 'Save Changes' : 'Log Job'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
