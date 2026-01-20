import { fail } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { contributionSchema, deleteSchema, savingsGoalSchema } from '$lib/formSchemas/savings';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { contribution, savingsGoal } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { formatDateForStorage } from '$lib/utils/dates';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { goals: [], contributions: [] };
	}

	// Fetch all goals
	const goals = await getDb().query.savingsGoal.findMany({
		with: {
			user: true
		},
		orderBy: [asc(savingsGoal.name)]
	});

	// Fetch all contributions
	const contributions = await getDb().query.contribution.findMany({
		with: {
			goal: {
				with: {
					user: true
				}
			},
			user: true
		},
		orderBy: [desc(contribution.date)]
	});

	// Calculate progress for each goal
	const goalsWithProgress = goals.map((goal) => {
		const goalContributions = contributions.filter((c) => c.goalId === goal.id);
		const currentAmount = goalContributions.reduce((sum, c) => sum + c.amount, 0);
		const percentage = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

		return {
			...goal,
			currentAmount,
			percentage: Math.min(percentage, 100)
		};
	});

	const savingsGoalForm = await superValidate(zod4(savingsGoalSchema));
	const contributionForm = await superValidate(zod4(contributionSchema));

	return {
		goals: goalsWithProgress,
		contributions,
		savingsGoalForm,
		contributionForm
	};
};

export const actions = {
	createGoal: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(savingsGoalSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(savingsGoal)
				.values(
					withAuditFieldsForCreate(
						{
							name: form.data.name,
							description: form.data.description || null,
							targetAmount: form.data.targetAmount,
							targetDate: form.data.targetDate ? formatDateForStorage(form.data.targetDate) : null,
							status: (form.data.status as 'active' | 'completed' | 'paused') || 'active',
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('Resource created successfully');
		} catch (error) {
			logger.error('Failed to create resource', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create savings goal. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, createGoal: true, form };
	}),

	updateGoal: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(savingsGoalSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const goalId = form.data.id!;
		try {
			await getDb()
				.update(savingsGoal)
				.set(
					withAuditFieldsForUpdate(
						{
							name: form.data.name,
							description: form.data.description || null,
							targetAmount: form.data.targetAmount,
							targetDate: form.data.targetDate ? formatDateForStorage(form.data.targetDate) : null,
							status: form.data.status || 'active'
						},
						user
					)
				)
				.where(eq(savingsGoal.id, goalId));

			logger.info('Resource updated successfully');
		} catch (error) {
			logger.error('Failed to update resource', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update savings goal. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, updateGoal: true, form };
	}),

	deleteGoal: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(deleteSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const goalId = form.data.id;
		try {
			// Check if contributions exist for this goal
			const existingContributions = await getDb()
				.select()
				.from(contribution)
				.where(eq(contribution.goalId, goalId));

			if (existingContributions.length > 0) {
				return message(
					form,
					{
						type: 'error',
						text: `Cannot delete goal. Please delete all ${existingContributions.length} contribution(s) first.`
					},
					{ status: 400 }
				);
			}

			// Delete the goal (only if no contributions exist)
			await getDb().delete(savingsGoal).where(eq(savingsGoal.id, goalId));

			logger.info('Resource deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete resource', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to delete savings goal. A database error occurred.' },
				{ status: 500 }
			);
		}

		return { success: true, deleteGoal: true, form };
	}),

	createContribution: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(contributionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(contribution)
				.values(
					withAuditFieldsForCreate(
						{
							goalId: form.data.goalId,
							amount: form.data.amount,
							date: formatDateForStorage(form.data.date),
							description: form.data.description || null,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('contribution created successfully');
		} catch (error) {
			logger.error('Failed to create contribution', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create contribution. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, createContribution: true, form };
	}),

	updateContribution: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(contributionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const contributionId = form.data.id!;
		try {
			await getDb()
				.update(contribution)
				.set(
					withAuditFieldsForUpdate(
						{
							goalId: form.data.goalId,
							amount: form.data.amount,
							date: formatDateForStorage(form.data.date),
							description: form.data.description || null
						},
						user
					)
				)
				.where(eq(contribution.id, contributionId));

			logger.info('Resource updated successfully');
		} catch (error) {
			logger.error('Failed to update contribution', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update contribution. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, updateContribution: true, form };
	}),

	deleteContribution: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(deleteSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const contributionId = form.data.id;
		try {
			await getDb().delete(contribution).where(eq(contribution.id, contributionId));

			logger.info('Resource deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete contribution', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to delete contribution. A database error occurred.' },
				{ status: 500 }
			);
		}

		return { success: true, deleteContribution: true, form };
	})
} satisfies Actions;
