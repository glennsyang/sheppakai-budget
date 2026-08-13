import { dashboardVisibilitySchema, transactionSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { requireUser } from '$lib/server/auth-guard-load';
import { loadMonthlyDashboard, loadYearlyDashboard } from '$lib/server/dashboard/summary';
import { dashboardPreferenceQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireUser(locals);
	const mode = url.searchParams.get('mode') === 'yearly' ? 'yearly' : 'monthly';

	const [dashboardData, hiddenSections, transactionForm] = await Promise.all([
		mode === 'monthly' ? loadMonthlyDashboard(url) : loadYearlyDashboard(url),
		dashboardPreferenceQueries.findHiddenKeysByUserId(user.id),
		superValidate(zod4(transactionSchema))
	]);

	const dashboardVisibilityForm = await superValidate(
		{ hiddenSections },
		zod4(dashboardVisibilitySchema)
	);

	return { ...dashboardData, hiddenSections, dashboardVisibilityForm, transactionForm };
};

export const actions = {
	updateVisibility: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(dashboardVisibilitySchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
		}

		try {
			await dashboardPreferenceQueries.setHiddenKeys(user.id, form.data.hiddenSections);
			return message(form, { type: 'success', text: 'Dashboard preferences updated.' });
		} catch (error) {
			logger.error('Failed to update dashboard section preferences', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update dashboard preferences. Please try again.' },
				{ status: 500 }
			);
		}
	})
} satisfies Actions;
