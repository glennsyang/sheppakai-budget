<script lang="ts">
	export type BadgeTone = 'neutral' | 'accent' | 'positive' | 'negative' | 'muted';

	interface Props {
		label: string;
		tone?: BadgeTone;
		title?: string;
	}

	let { label, tone = 'neutral', title }: Props = $props();

	const toneClass: Record<BadgeTone, string> = {
		neutral: 'bg-muted text-foreground',
		muted: 'text-muted-foreground border',
		accent: 'bg-accent text-accent-foreground',
		positive: 'bg-positive/12 text-positive',
		negative: 'bg-destructive/12 text-destructive'
	};
</script>

<span
	{title}
	class={[
		'inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium whitespace-nowrap',
		toneClass[tone]
	]}>{label}</span
>
