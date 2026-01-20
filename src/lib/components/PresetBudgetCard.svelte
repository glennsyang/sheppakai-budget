<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import XIcon from '@lucide/svelte/icons/x';

	import { enhance as enhanceAction } from '$app/forms';
	import { Input } from '$lib/components/ui/input';
	import { padMonth } from '$lib/utils/dates';

	interface Props {
		title: string;
		amount: number;
		isSelected: boolean;
		presetType: 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom';
		isCustom?: boolean;
		isEditing?: boolean;
		editAmount?: string;
		budgetId?: string | null;
		selectedMonth: number;
		selectedYear: number;
		categoryId: string;
		onSelect: () => void;
		onEdit?: () => void;
		onCancel?: () => void;
	}

	let {
		title,
		amount,
		isSelected,
		presetType,
		isCustom = false,
		isEditing = false,
		editAmount = '',
		budgetId = null,
		selectedMonth,
		selectedYear,
		categoryId,
		onSelect,
		onEdit,
		onCancel
	}: Props = $props();
</script>

{#if isCustom}
	<!-- Custom Amount Card -->
	<div
		class="relative cursor-pointer rounded-lg border bg-card p-4 shadow transition-all {isSelected
			? 'border-green-500 hover:border-green-500'
			: 'hover:border-primary'}"
		onclick={onSelect}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onSelect();
			}
		}}
	>
		<div class="absolute top-2 right-2">
			{#if isSelected}
				<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
			{:else}
				<CheckCircleIcon class="h-5 w-5 text-gray-300" />
			{/if}
		</div>
		<div class="flex flex-col items-center justify-center space-y-2 pt-2">
			{#if isEditing}
				<form
					method="POST"
					action={budgetId ? '?/update' : '?/create'}
					use:enhanceAction
					class="flex flex-col items-center gap-2"
				>
					{#if budgetId}
						<input type="hidden" name="id" value={budgetId} />
					{/if}
					<input type="hidden" name="month" value={padMonth(selectedMonth.toString())} />
					<input type="hidden" name="year" value={selectedYear.toString()} />
					<input type="hidden" name="categoryId" value={categoryId} />
					<input type="hidden" name="presetType" value={presetType} />
					<Input
						type="number"
						name="amount"
						value={editAmount}
						step="0.01"
						min="0"
						class="w-32 text-center text-2xl font-bold"
						autofocus
					/>
					<div class="flex items-center gap-1">
						<button type="submit" class="rounded p-1 hover:bg-green-100 hover:text-green-600">
							<CheckIcon class="h-4 w-4" />
						</button>
						<button
							type="button"
							class="rounded p-1 hover:bg-red-100 hover:text-red-600"
							onclick={onCancel}
						>
							<XIcon class="h-4 w-4" />
						</button>
					</div>
				</form>
			{:else}
				<p class="text-2xl font-bold">${amount.toFixed(2)}</p>
			{/if}
			<div class="flex items-center justify-center gap-1">
				<p class="text-center text-sm text-muted-foreground">{title}</p>
				{#if !isEditing}
					<button
						type="button"
						class="rounded p-1 hover:bg-muted"
						onclick={(e) => {
							e.stopPropagation();
							if (onEdit) onEdit();
						}}
					>
						<PencilIcon class="h-3 w-3" />
					</button>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Preset Amount Card -->
	<form
		method="POST"
		action={budgetId ? '?/update' : '?/create'}
		use:enhanceAction
		class="relative"
	>
		{#if budgetId}
			<input type="hidden" name="id" value={budgetId} />
		{/if}
		<input type="hidden" name="month" value={padMonth(selectedMonth.toString())} />
		<input type="hidden" name="year" value={selectedYear.toString()} />
		<input type="hidden" name="categoryId" value={categoryId} />
		<input type="hidden" name="amount" value={amount.toFixed(2)} />
		<input type="hidden" name="presetType" value={presetType} />
		<button
			type="submit"
			class="relative w-full rounded-lg border bg-card p-4 shadow transition-all {isSelected
				? 'border-green-500 hover:border-green-500'
				: 'hover:border-primary'}"
			onclick={(e) => {
				e.preventDefault();
				onSelect();
				(e.currentTarget.closest('form') as HTMLFormElement)?.requestSubmit();
			}}
		>
			<div class="absolute top-2 right-2">
				{#if isSelected}
					<CheckCircleIcon class="h-5 w-5 fill-green-500 text-white" />
				{:else}
					<CheckCircleIcon class="h-5 w-5 text-gray-300" />
				{/if}
			</div>
			<div class="flex flex-col items-center justify-center space-y-2 pt-2">
				<p class="text-2xl font-bold">${amount.toFixed(2)}</p>
				<p class="text-center text-sm text-muted-foreground">{title}</p>
			</div>
		</button>
	</form>{/if}
