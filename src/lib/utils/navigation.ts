/**
 * Navigation Classification
 *
 * Distinguishes a same-route navigation (a search-param change such as a month
 * or year switch) from a cross-route one. Same-route navigations should keep
 * the page frame mounted and skeleton only the data regions; cross-route
 * navigations replace the whole view.
 *
 * Kept free of `$app/state` imports so it stays unit-testable.
 */

export type NavigationKind = 'idle' | 'same-route' | 'cross-route';

/**
 * Classify an in-flight navigation.
 *
 * Call sites pass `navigating.to?.route.id` directly:
 * - `undefined` means no navigation is in flight.
 * - `null` means the target is not a SvelteKit-owned route, which counts as
 *   cross-route.
 */
export function classifyNavigation(
	toRouteId: string | null | undefined,
	currentRouteId: string | null
): NavigationKind {
	if (toRouteId === undefined) {
		return 'idle';
	}

	return toRouteId === currentRouteId ? 'same-route' : 'cross-route';
}

/**
 * The nav URL a path belongs to: the longest URL that is the path itself or a
 * parent of it, so /window-cleaning/jobs doesn't also light up /window-cleaning.
 */
export function matchNavUrl(path: string, urls: (string | undefined)[]): string | null {
	return (
		urls
			.filter((url): url is string => !!url && (path === url || path.startsWith(`${url}/`)))
			.sort((a, b) => b.length - a.length)[0] ?? null
	);
}
