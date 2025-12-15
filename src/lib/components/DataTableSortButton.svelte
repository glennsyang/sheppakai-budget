<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index.js';

	interface DataTableSortButtonProps extends ComponentProps<typeof Button> {
		columnName: string;
	}

	let { variant = 'ghost', columnName, ...restProps }: DataTableSortButtonProps = $props();
</script>

<Button {variant} {...restProps}>
	{columnName}
	<ArrowUpDownIcon class="ms-2" />
</Button>
