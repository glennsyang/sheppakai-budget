import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { savings } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

import type { Savings } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { savings: [] };
	}

	const allSavings: Savings[] = (await getDb().query.savings.findMany({
		with: {
			user: true
		},
		orderBy: [asc(savings.title)]
	})) as Savings[];

	return {
		savings: allSavings
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasTitle = data.has('title');
		const hasAmount = data.has('amount');

		if (!hasTitle || !hasAmount) {
			return fail(400, { hasTitle, hasAmount });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(savings)
				.values(
					withAuditFieldsForCreate(
						{
							title: data.get('title')?.toString() || '',
							description: data.get('description')?.toString() || null,
							amount: Number(data.get('amount')),
							userId: userId
						},
						userId
					)
				);

			logger.info('savings created successfully');
		} catch (error) {
			logger.error('Failed to create savings', error);
			return fail(500, { error: 'Failed to create savings entry' });
		}

		return { success: true, create: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasTitle = data.has('title');
		const hasAmount = data.has('amount');

		if (!hasId || !hasTitle || !hasAmount) {
			return fail(400, { hasId, hasTitle, hasAmount });
		}

		const savingsId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(savings)
				.set(
					withAuditFieldsForUpdate(
						{
							title: data.get('title')?.toString() || '',
							description: data.get('description')?.toString() || null,
							amount: Number(data.get('amount'))
						},
						userId
					)
				)
				.where(eq(savings.id, savingsId));

			logger.info('savings updated successfully');
		} catch (error) {
			logger.error('Failed to update savings', error);
			return fail(500, { error: 'Failed to update savings entry' });
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

		const savingsId = data.get('id')!.toString();

		try {
			await getDb().delete(savings).where(eq(savings.id, savingsId));

			logger.info('savings deleted successfully');
		} catch (error) {
			logger.error('Failed to delete savings', error);
			return fail(500, { error: 'Failed to delete savings entry' });
		}

		return { success: true, delete: true };
	}
} satisfies Actions;
