<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { windowCleaningCustomerSchema } from '$lib/formSchemas/windowCleaning';

	import type { BaseModalProps, WindowCleaningCustomer } from '$lib';

	interface Props extends BaseModalProps<WindowCleaningCustomer> {
		customerForm: SuperValidated<z.infer<typeof windowCleaningCustomerSchema>>;
	}

	let {
		open = $bindable(),
		initialData,
		isEditing,
		isLoading = $bindable(false),
		customerForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(customerForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Customer updated successfully!' : 'Customer added successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'adding'} customer. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'adding'} the customer. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.name = initialData.name || '';
				$form.address = initialData.address || '';
				$form.city = initialData.city || '';
				$form.unitNumber = initialData.unitNumber || '';
				$form.buzzerNumber = initialData.buzzerNumber || '';
				$form.phoneNumber = initialData.phoneNumber || '';
				$form.notes = initialData.notes || '';
			} else {
				$form.id = '';
				$form.name = '';
				$form.address = '';
				$form.city = '';
				$form.unitNumber = '';
				$form.buzzerNumber = '';
				$form.phoneNumber = '';
				$form.notes = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>
				{isEditing ? 'Edit Customer' : 'Add Customer'}
			</Dialog.Title>
			<Dialog.Description>
				{isEditing ? "Update this customer's information." : 'Add a new window cleaning customer.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/window-cleaning?/updateCustomer' : '/window-cleaning?/createCustomer'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="customer-name" class="text-sm font-medium"
					>Name <span class="text-destructive">*</span></label
				>
				<Input
					id="customer-name"
					name="name"
					type="text"
					bind:value={$form.name}
					placeholder="Jane Smith"
					required
				/>
				{#if $errors.name}
					<p class="text-sm text-destructive">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="customer-address" class="text-sm font-medium"
					>Address <span class="text-destructive">*</span></label
				>
				<Input
					id="customer-address"
					name="address"
					type="text"
					bind:value={$form.address}
					placeholder="123 Main St"
					required
				/>
				{#if $errors.address}
					<p class="text-sm text-destructive">{$errors.address}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="customer-city" class="text-sm font-medium"
						>City <span class="text-destructive">*</span></label
					>
					<Input
						id="customer-city"
						name="city"
						type="text"
						bind:value={$form.city}
						placeholder="Vancouver"
						required
					/>
					{#if $errors.city}
						<p class="text-sm text-destructive">{$errors.city}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="customer-unit" class="text-sm font-medium"
						>Unit # <span class="text-xs text-muted-foreground">(optional)</span></label
					>
					<Input
						id="customer-unit"
						name="unitNumber"
						type="text"
						bind:value={$form.unitNumber}
						placeholder="4B"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<label for="customer-buzzer" class="text-sm font-medium"
						>Buzzer # <span class="text-xs text-muted-foreground">(optional)</span></label
					>
					<Input
						id="customer-buzzer"
						name="buzzerNumber"
						type="text"
						bind:value={$form.buzzerNumber}
						placeholder="123"
					/>
				</div>

				<div class="space-y-2">
					<label for="customer-phone" class="text-sm font-medium"
						>Phone <span class="text-xs text-muted-foreground">(optional)</span></label
					>
					<Input
						id="customer-phone"
						name="phoneNumber"
						type="tel"
						bind:value={$form.phoneNumber}
						placeholder="604-555-1234"
					/>
				</div>
			</div>

			<div class="space-y-2">
				<label for="customer-notes" class="text-sm font-medium"
					>Notes <span class="text-xs text-muted-foreground">(optional)</span></label
				>
				<Textarea
					id="customer-notes"
					name="notes"
					bind:value={$form.notes}
					placeholder="Any notes about this customer..."
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
					disabled={$submitting || isLoading || !$form.name || !$form.address || !$form.city}
				>
					{isEditing ? 'Save Changes' : 'Add Customer'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
