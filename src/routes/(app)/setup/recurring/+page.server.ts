import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { recurring } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	return {
		recurring: await getDb().query.recurring.findMany({
			with: {
				user: true
			},
			orderBy: [asc(recurring.merchant)]
		})
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasMerchant = data.has('merchant');
		const hasCadence = data.has('cadence');

		if (!hasAmount || !hasDescription || !hasMerchant) {
			return fail(400, { hasAmount, hasDescription, hasMerchant, hasCadence });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(recurring)
				.values(
					withAuditFieldsForCreate(
						{
							amount: Number(data.get('amount')),
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							merchant: data.get('merchant')?.toString() || '',
							cadence: data.get('cadence')?.toString() || '',
							userId: userId
						},
						userId
					)
				);

			console.log('Created recurring entry for user:', userId);
		} catch (error) {
			console.error('Error creating recurring entry:', error);
			return fail(500, { error: 'Failed to create recurring entry' });
		}

		return { success: true, create: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasMerchant = data.has('merchant');
		const hasCadence = data.has('cadence');

		if (!hasId || !hasAmount || !hasDescription || !hasMerchant || !hasCadence) {
			return fail(400, { hasId, hasDescription, hasAmount, hasMerchant, hasCadence });
		}

		// Update the recurring entry in the database
		const recurringId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(recurring)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: Number(data.get('amount')),
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							merchant: data.get('merchant')?.toString() || '',
							cadence: data.get('cadence')?.toString() || ''
						},
						userId
					)
				)
				.where(eq(recurring.id, recurringId));

			console.log('Updated recurring entry:', recurringId);
		} catch (error) {
			console.error('Error updating recurring entry:', error);
			return fail(500, { error: 'Failed to update recurring entry' });
		}

		return { success: true, update: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const recurringId = data.get('id')!.toString();

		try {
			await getDb().delete(recurring).where(eq(recurring.id, recurringId));

			console.log('Deleted recurring entry:', recurringId);
		} catch (error) {
			console.error('Error deleting recurring entry:', error);
			return fail(500, { error: 'Failed to delete recurring entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
