import { navigating, page } from '$app/state';

import { classifyNavigation } from './navigation';

/**
 * How long a same-route navigation must run before a skeleton is shown.
 *
 * Local SQLite loads are frequently well under this, and a skeleton that
 * flashes for a few frames reads as a glitch. Below the threshold the previous
 * content simply stays put until the new data lands.
 */
const SKELETON_DELAY_MS = 150;

/**
 * Tracks whether the current route is reloading its own data — i.e. a
 * search-param change such as a month or year switch — for longer than
 * `delayMs`.
 *
 * Must be called during component initialisation, since it registers an
 * `$effect`.
 */
export function usePendingReload(delayMs: number = SKELETON_DELAY_MS) {
	let pending = $state(false);

	$effect(() => {
		if (classifyNavigation(navigating.to?.route.id, page.route.id) !== 'same-route') {
			pending = false;
			return;
		}

		const timer = setTimeout(() => {
			pending = true;
		}, delayMs);

		return () => {
			clearTimeout(timer);
			pending = false;
		};
	});

	return {
		get current() {
			return pending;
		}
	};
}
