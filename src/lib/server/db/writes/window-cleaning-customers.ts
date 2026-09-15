import { getDb } from '$lib/server/db';
import { windowCleaningCustomerQueries } from '$lib/server/db/queries';
import { windowCleaningCustomer } from '$lib/server/db/schema';
import type { WindowCleaningCustomer } from '$lib/types';
import { getCurrentUTCTimestamp } from '$lib/utils/dates';
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

function toRow(input: WindowCleaningCustomerInput) {
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

/** Mirrors `createAction`/`updateAction` field mapping in `src/routes/(app)/window-cleaning/+page.server.ts`. */
export async function createWindowCleaningCustomer(
	input: WindowCleaningCustomerInput,
	userId: string
): Promise<WindowCleaningCustomer> {
	const [inserted] = await getDb()
		.insert(windowCleaningCustomer)
		.values({ ...toRow(input), userId, createdBy: userId, updatedBy: userId })
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
		.set({ ...toRow(input), updatedBy: userId, updatedAt: getCurrentUTCTimestamp() })
		.where(eq(windowCleaningCustomer.id, id));

	return windowCleaningCustomerQueries.findById(id);
}
