import { getContext, setContext } from 'svelte';

import type { Category } from '$lib/types';

/**
 * Unique symbol key for categories context to prevent collisions
 */
const CATEGORIES_KEY = Symbol('categories');

/**
 * Type for the categories context value
 */
type CategoriesContext = () => Category[];

/**
 * Sets the categories context in the component tree.
 * Should be called once in the root layout.
 *
 * @param categories - Array of categories to make available
 */
export function setCategoriesContext(categories: Category[]): void {
	setContext(CATEGORIES_KEY, () => categories);
}

/**
 * Gets the categories context from the component tree.
 * Returns a function that provides the current categories array.
 *
 * @returns Function that returns the categories array
 * @throws Error if context is not set (during development)
 */
export function getCategoriesContext(): CategoriesContext {
	const context = getContext<CategoriesContext>(CATEGORIES_KEY);

	if (!context) {
		throw new Error(
			'Categories context not found. Ensure setCategoriesContext() is called in a parent component.'
		);
	}

	return context;
}
