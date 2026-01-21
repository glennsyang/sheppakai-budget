import { getContext, setContext } from 'svelte';
import type { SuperValidated } from 'sveltekit-superforms';

/**
 * Creates typed context helpers for a specific form.
 *
 * @template T - The inferred schema type from the form
 * @param contextName - Unique name for this form context
 * @returns Object with setter and getter functions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFormContext<T extends Record<string, any>>(contextName: string) {
	const FORM_KEY = Symbol(contextName);
	type FormContext = SuperValidated<T>;

	return {
		/**
		 * Sets the form context in the component tree.
		 *
		 * @param form - Superforms validated form object
		 */
		set(form: FormContext): void {
			setContext(FORM_KEY, form);
		},

		/**
		 * Gets the form context from the component tree.
		 *
		 * @returns Superforms validated form object
		 * @throws Error if context is not set (during development)
		 */
		get(): FormContext {
			const context = getContext<FormContext>(FORM_KEY);

			if (!context) {
				throw new Error(
					`${contextName} context not found. Ensure the form context is set in a parent component.`
				);
			}

			return context;
		}
	};
}

// Pre-defined form contexts for common use cases
export const incomeFormContext = createFormContext('incomeForm');
export const transactionFormContext = createFormContext('transactionForm');
export const savingsFormContext = createFormContext('savingsForm');
