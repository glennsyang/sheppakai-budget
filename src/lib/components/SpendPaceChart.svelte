<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatCurrency, formatCurrencyRounded, monthNames } from '$lib/utils';

	interface Props {
		/** Discretionary transactions for the month (recurring excluded). */
		expenses: { date: string; amount: number }[];
		/** Discretionary budget for the month (planned minus recurring). */
		budget: number;
		month: number;
		daysInMonth: number;
		/** Last day with actual spend to draw: today for the current month, the full month for past ones, 0 for future ones. */
		throughDay: number;
		/** Month is over: the hero states the result, so skip the pace caption. */
		complete?: boolean;
	}

	let { expenses, budget, month, daysInMonth, throughDay, complete = false }: Props = $props();

	const monthShort = $derived(monthNames[month - 1]?.slice(0, 3) ?? '');

	function dayOf(date: string): number {
		const match = /^\d{4}-\d{2}-(\d{2})/.exec(date);
		return match ? Number(match[1]) : new Date(date).getDate();
	}

	// cumulative[d] = spent through day d (index 0 = before day 1)
	let cumulative = $derived.by(() => {
		const perDay = Array.from({ length: daysInMonth + 1 }, () => 0);
		for (const e of expenses) {
			const d = dayOf(e.date);
			if (d >= 1 && d <= daysInMonth) perDay[d] += e.amount;
		}
		const out = Array.from({ length: daysInMonth + 1 }, () => 0);
		for (let d = 1; d <= daysInMonth; d++) out[d] = out[d - 1] + perDay[d];
		return out;
	});

	let lastDay = $derived(Math.min(Math.max(throughDay, 0), daysInMonth));
	let spentToDate = $derived(cumulative[lastDay] ?? 0);
	let yMax = $derived(Math.max(budget, cumulative[daysInMonth] ?? 0, 1) * 1.1);

	const pace = (d: number) => (budget * d) / daysInMonth;
	const x = (d: number) => (d / daysInMonth) * 100;
	const y = (v: number) => 100 - (v / yMax) * 100;

	let actualPath = $derived.by(() => {
		if (lastDay < 1) return '';
		let p = `M0,${y(0)}`;
		for (let d = 1; d <= lastDay; d++) {
			// step at the start of each day so a day's spend lands on that day
			p += ` L${x(d - 1)},${y(cumulative[d - 1])} L${x(d - 1)},${y(cumulative[d])} L${x(d)},${y(cumulative[d])}`;
		}
		return p;
	});
	let areaPath = $derived(actualPath ? `${actualPath} L${x(lastDay)},100 L0,100 Z` : '');

	let paceDelta = $derived(spentToDate - pace(lastDay));

	// Scrub readout
	let scrubDay = $state<number | null>(null);
	let readoutDay = $derived(scrubDay ?? (lastDay >= 1 ? lastDay : null));
	let readoutSpent = $derived(
		readoutDay !== null && readoutDay <= lastDay ? cumulative[readoutDay] : null
	);

	function dayFromPointer(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
		return Math.min(Math.max(Math.ceil(ratio * daysInMonth), 1), daysInMonth);
	}

	function onKeydown(event: KeyboardEvent) {
		const current = scrubDay ?? Math.max(lastDay, 1);
		if (event.key === 'ArrowLeft') scrubDay = Math.max(current - 1, 1);
		else if (event.key === 'ArrowRight') scrubDay = Math.min(current + 1, daysInMonth);
		else if (event.key === 'Escape') scrubDay = null;
		else return;
		event.preventDefault();
	}

	let summary = $derived(
		lastDay < 1
			? `${monthShort} hasn't started. Discretionary budget ${formatCurrency(budget)}.`
			: `Spent ${formatCurrency(spentToDate)} through ${monthShort} ${lastDay}, against a pace of ${formatCurrency(pace(lastDay))} toward a ${formatCurrency(budget)} discretionary budget.`
	);
</script>

<div class="flex h-full flex-col gap-3">
	<div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
		<p class="text-sm font-medium">Spending pace</p>
		<p class="text-muted-foreground text-xs tabular-nums" aria-live="polite">
			{#if readoutDay !== null}
				<span class="text-foreground font-medium">{monthShort} {readoutDay}</span>
				{#if readoutSpent !== null}
					· {formatCurrency(readoutSpent)} discretionary
				{/if}
				· {formatCurrency(pace(readoutDay))} pace
			{:else}
				Budget {formatCurrency(budget)}
			{/if}
		</p>
	</div>

	<div
		class="focus-visible:ring-ring/50 relative min-h-36 flex-1 cursor-crosshair touch-pan-y rounded-md outline-none select-none focus-visible:ring-[3px]"
		role="slider"
		tabindex="0"
		aria-label={summary}
		aria-valuemin={1}
		aria-valuemax={daysInMonth}
		aria-valuenow={readoutDay ?? 1}
		aria-valuetext={readoutDay !== null
			? `${monthShort} ${readoutDay}${readoutSpent !== null ? `, ${formatCurrency(readoutSpent)} spent` : ''}, pace ${formatCurrency(pace(readoutDay))}`
			: summary}
		onpointermove={(e) => (scrubDay = dayFromPointer(e))}
		onpointerdown={(e) => (scrubDay = dayFromPointer(e))}
		onpointerleave={() => (scrubDay = null)}
		onkeydown={onKeydown}
		onblur={() => (scrubDay = null)}
	>
		<svg
			class="absolute inset-0 h-full w-full overflow-visible"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="pace-fill" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="var(--foreground)" stop-opacity="0.1" />
					<stop offset="100%" stop-color="var(--foreground)" stop-opacity="0" />
				</linearGradient>
			</defs>
			<line
				x1="0"
				x2="100"
				y1="100"
				y2="100"
				class="stroke-border"
				vector-effect="non-scaling-stroke"
			/>
			<line
				x1="0"
				x2="100"
				y1={y(budget)}
				y2={y(budget)}
				class="stroke-border"
				stroke-dasharray="2 4"
				vector-effect="non-scaling-stroke"
			/>
			<line
				x1="0"
				y1={y(0)}
				x2="100"
				y2={y(budget)}
				class="stroke-muted-foreground/60"
				stroke-width="1.5"
				stroke-dasharray="4 4"
				vector-effect="non-scaling-stroke"
			/>
			{#if areaPath}
				<path d={areaPath} fill="url(#pace-fill)" />
				<path
					d={actualPath}
					fill="none"
					class="stroke-foreground/80"
					stroke-width="2"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
			{#if scrubDay !== null}
				<line
					x1={x(scrubDay)}
					x2={x(scrubDay)}
					y1="0"
					y2="100"
					class="stroke-foreground/25"
					vector-effect="non-scaling-stroke"
				/>
			{/if}
		</svg>

		{#if lastDay >= 1}
			<span
				class="bg-primary ring-card pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-[3px]"
				style="left: {x(lastDay)}%; top: {y(spentToDate)}%"
				aria-hidden="true"
			></span>
		{/if}
		{#if scrubDay !== null && readoutSpent !== null}
			<span
				class="bg-foreground pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
				style="left: {x(scrubDay)}%; top: {y(readoutSpent)}%"
				aria-hidden="true"
			></span>
		{/if}
		<span
			class="text-muted-foreground bg-card/80 pointer-events-none absolute right-0 -translate-y-full pb-1 text-[0.6875rem] tabular-nums"
			style="top: {y(budget)}%"
			aria-hidden="true">Budget {formatCurrencyRounded(budget)}</span
		>
	</div>

	<div
		class="text-muted-foreground flex justify-between text-[0.6875rem] tabular-nums"
		aria-hidden="true"
	>
		<span>{monthShort} 1</span>
		<span>{monthShort} {Math.ceil(daysInMonth / 2)}</span>
		<span>{monthShort} {daysInMonth}</span>
	</div>

	{#if complete}
		<!-- result lives in the hero -->
	{:else if lastDay >= 1 && budget > 0}
		<p class="text-sm">
			{#if Math.abs(paceDelta) < 1}
				<span class="text-muted-foreground">Right on pace.</span>
			{:else if paceDelta > 0}
				<span class="text-destructive font-medium tabular-nums"
					>{formatCurrency(paceDelta)} ahead of pace</span
				>
				<span class="text-muted-foreground">for day {lastDay}.</span>
			{:else}
				<span class="text-positive font-medium tabular-nums"
					>{formatCurrency(-paceDelta)} under pace</span
				>
				<span class="text-muted-foreground">for day {lastDay}.</span>
			{/if}
		</p>
	{:else if budget <= 0}
		<p class="text-muted-foreground text-sm">
			No discretionary budget set for {monthNames[month - 1]}.
			<a
				href={resolve('/budget')}
				class="text-primary font-medium underline-offset-4 hover:underline">Set one</a
			>
			to see your pace.
		</p>
	{/if}
</div>
