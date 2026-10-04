<script lang="ts">
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface DataTableSortButtonProps extends HTMLButtonAttributes {
		columnName: string;
		/** Kept for call-site compatibility; the icon always trails the label. */
		iconPosition?: 'left' | 'right';
	}

	let {
		columnName,
		iconPosition: _iconPosition,
		class: className,
		...restProps
	}: DataTableSortButtonProps = $props();
</script>

<button
	type="button"
	class={[
		'group hover:text-foreground focus-visible:ring-ring/50 -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]',
		className
	]}
	{...restProps}
>
	{columnName}
	<ArrowUpDownIcon
		class="size-3 opacity-40 transition-opacity group-hover:opacity-100"
		aria-hidden="true"
	/>
</button>
