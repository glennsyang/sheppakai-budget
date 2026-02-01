<script lang="ts">
	import { formatCurrency } from '$lib/utils';

	interface Props {
		label: string;
		amount: number;
		emphasized?: boolean;
		bordered?: boolean;
		muted?: boolean;
	}

	let { label, amount, emphasized = false, bordered = false, muted = true }: Props = $props();
</script>

<div class="flex items-center justify-between {bordered ? 'border-t pt-4' : ''}">
	<p class="text-sm font-medium {muted ? 'text-muted-foreground' : ''}">
		{label}
	</p>
	<p class={emphasized ? 'text-2xl font-bold' : 'text-lg font-semibold'}>
		{formatCurrency(amount)}
	</p>
</div>
