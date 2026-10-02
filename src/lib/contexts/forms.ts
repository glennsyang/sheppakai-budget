import type {
	banUserSchema,
	categorySchema,
	contributionSchema,
	idSchema,
	incomeSchema,
	recurringSchema,
	restoreCustomerSchema,
	savingsSchema,
	setPasswordSchema,
	setUserRoleSchema,
	transactionSchema,
	unArchiveSchema,
	windowCleaningCustomerSchema,
	windowCleaningJobSchema
} from '$lib/formSchemas';
import type { SuperValidated } from 'sveltekit-superforms';
import type { z } from 'zod';

import { createContext } from './values';

/**
 * Creates typed context helpers for a specific form.
 *
 * @template T - The inferred schema type from the form
 * @param contextName - Unique name for this form context
 * @returns Object with setter and getter functions
 */
function createFormContext<T extends Record<string, unknown>>(contextName: string) {
	return createContext<SuperValidated<T>>(contextName);
}

export const incomeFormContext = createFormContext<z.infer<typeof incomeSchema>>('incomeForm');
export const transactionFormContext =
	createFormContext<z.infer<typeof transactionSchema>>('transactionForm');
export const savingsFormContext = createFormContext<z.infer<typeof savingsSchema>>('savingsForm');
export const categoryFormContext =
	createFormContext<z.infer<typeof categorySchema>>('categoryForm');
export const recurringFormContext =
	createFormContext<z.infer<typeof recurringSchema>>('recurringForm');
export const contributionFormContext =
	createFormContext<z.infer<typeof contributionSchema>>('contributionForm');
export const customerFormContext =
	createFormContext<z.infer<typeof windowCleaningCustomerSchema>>('customerForm');
export const jobFormContext = createFormContext<z.infer<typeof windowCleaningJobSchema>>('jobForm');
export const restoreCustomerFormContext =
	createFormContext<z.infer<typeof restoreCustomerSchema>>('restoreCustomerForm');
export const setUserRoleFormContext =
	createFormContext<z.infer<typeof setUserRoleSchema>>('setUserRoleForm');
export const setPasswordFormContext =
	createFormContext<z.infer<typeof setPasswordSchema>>('setPasswordForm');
export const banUserFormContext = createFormContext<z.infer<typeof banUserSchema>>('banUserForm');
export const unArchiveFormContext =
	createFormContext<z.infer<typeof unArchiveSchema>>('unArchiveForm');
export const revokeApiKeyFormContext =
	createFormContext<z.infer<typeof idSchema>>('revokeApiKeyForm');
