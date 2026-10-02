import type { SavingsGoal, WindowCleaningCustomerWithStats } from '$lib/types';
import { getContext, setContext } from 'svelte';

/**
 * Creates typed, symbol-keyed context helpers for a single value.
 *
 * @template T - The type of the value stored in context
 * @param contextName - Unique name for this context (used in the symbol and error message)
 * @returns Object with setter and getter functions
 */
export function createContext<T>(contextName: string) {
	const KEY = Symbol(contextName);

	return {
		/**
		 * Sets the value in the component tree.
		 *
		 * @param value - Value to make available to descendants
		 */
		set(value: T): void {
			setContext(KEY, value);
		},

		/**
		 * Gets the value from the component tree.
		 *
		 * @returns The value set by a parent component
		 * @throws Error if context is not set
		 */
		get(): T {
			const context = getContext<T | undefined>(KEY);

			if (!context) {
				throw new Error(
					`${contextName} context not found. Ensure the context is set in a parent component.`
				);
			}

			return context;
		}
	};
}

export interface ContributionSuccessPayload {
	goalId: string;
	amount: number;
	previousGoalId?: string;
	previousAmount?: number;
}

export const savingsGoalsContext = createContext<() => SavingsGoal[]>('savingsGoals');
export const contributionSuccessContext =
	createContext<(payload: ContributionSuccessPayload) => void>('onContributionSuccess');
export const openCustomerSheetContext =
	createContext<(customer: WindowCleaningCustomerWithStats) => void>('openCustomerSheet');
