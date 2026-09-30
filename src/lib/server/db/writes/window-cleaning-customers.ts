import { getDb } from '$lib/server/db';
import { windowCleaningCustomerQueries } from '$lib/server/db/queries';
import { windowCleaningCustomer } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import type { WindowCleaningCustomer } from '$lib/types';
import { eq } from 'drizzle-orm';

export type WindowCleaningCustomerInput = {
	name: string;
	address: string;
	city: string;
	unitNumber?: string;
	buzzerNumber?: string;
	phoneNumber?: string;
	email?: string;
	notes?: string;
};

/** Input → row mapping shared by the UI form actions and the API write path. */
export function toWindowCleaningCustomerRow(input: WindowCleaningCustomerInput) {
	return {
		name: input.name,
		address: input.address,
		city: input.city,
		unitNumber: input.unitNumber || null,
		buzzerNumber: input.buzzerNumber || null,
		phoneNumber: input.phoneNumber || null,
		email: input.email || null,
		notes: input.notes || null
	};
}

export async function createWindowCleaningCustomer(
	input: WindowCleaningCustomerInput,
	userId: string
): Promise<WindowCleaningCustomer> {
	const [inserted] = await getDb()
		.insert(windowCleaningCustomer)
		.values(withAuditFieldsForCreate({ ...toWindowCleaningCustomerRow(input), userId }, userId))
		.returning();

	const withRelations = await windowCleaningCustomerQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch window cleaning customer ${inserted.id} after creation`);
	}
	return withRelations;
}

export async function updateWindowCleaningCustomer(
	id: string,
	input: WindowCleaningCustomerInput,
	userId: string
): Promise<WindowCleaningCustomer | undefined> {
	await getDb()
		.update(windowCleaningCustomer)
		.set(withAuditFieldsForUpdate(toWindowCleaningCustomerRow(input), userId))
		.where(eq(windowCleaningCustomer.id, id));

	return windowCleaningCustomerQueries.findById(id);
}
