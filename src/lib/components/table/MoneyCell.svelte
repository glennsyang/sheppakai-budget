<script lang="ts">
	interface Props {
		value: number;
		currency?: 'USD' | 'CAD';
		/** Muted for secondary amounts such as GST or tips. */
		muted?: boolean;
		/** Money state only: never decoration. */
		tone?: 'positive' | 'negative';
	}

	let { value, currency = 'USD', muted = false, tone }: Props = $props();

	const formatted = $derived(
		new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
			style: 'currency',
			currency
		}).format(value)
	);
</script>

<span
	class={[
		'block text-right whitespace-nowrap tabular-nums',
		muted ? 'text-muted-foreground' : 'font-medium',
		tone === 'positive' && 'text-positive',
		tone === 'negative' && 'text-destructive'
	]}>{formatted}</span
>
