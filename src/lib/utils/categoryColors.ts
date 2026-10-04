// Category identity colour, stable by alphabetical position. Seven hues 30° apart, clear of
// the red, amber and green bands reserved for money state, in two lightness tiers (14 colours).
// Handed out in a stride so neighbouring categories land far apart on both axes.
const CATEGORY_HUES = [190, 280, 340, 220, 310, 115, 250];

export const FALLBACK_CATEGORY_COLOR = 'var(--chart-8)';

export function categoryColorMap(categories: { id: string; name: string }[]): Map<string, string> {
	const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
	return new Map(
		sorted.map((c, i) => {
			const hue = CATEGORY_HUES[i % CATEGORY_HUES.length];
			const tier = Math.floor(i / CATEGORY_HUES.length) % 2;
			return [
				c.id,
				`oklch(calc(var(--category-l) - ${tier} * var(--category-tier-step)) var(--category-c) ${hue})`
			];
		})
	);
}
