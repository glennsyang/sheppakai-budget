<script lang="ts">
	interface Props {
		name: string;
		color?: string;
	}

	let { name, color }: Props = $props();
</script>

<span class="flex min-w-0 items-center gap-2">
	<span
		class="size-2 shrink-0 rounded-full"
		style:background={color ?? 'var(--chart-8)'}
		aria-hidden="true"
	></span>
	<span class="truncate">{name}</span>
</span>
