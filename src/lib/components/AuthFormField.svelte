<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		/** Used for both the input `id` and its `name`, so it must match the form field key. */
		id: string;
		label: string;
		value: string;
		type?: 'email' | 'password' | 'text';
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		required?: boolean;
		errors?: string[];
	}

	let {
		id,
		label,
		value = $bindable(),
		type = 'text',
		placeholder,
		autocomplete,
		required = false,
		errors
	}: Props = $props();
</script>

<div class="space-y-2">
	<label for={id} class="block text-sm font-medium">{label}</label>
	<Input
		{id}
		name={id}
		{type}
		{placeholder}
		bind:value
		class={errors ? 'border-red-400 bg-white/80' : 'bg-white/80'}
		{autocomplete}
		{required}
	/>
	{#if errors}
		<p class="text-sm text-red-200">{errors}</p>
	{/if}
</div>
