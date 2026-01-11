import { fail } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { contribution, savingsGoal } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { localDateToUTCTimestamp } from '$lib/utils/dates';

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

	return {
		goals: goalsWithProgress,
		contributions
	};
};

export const actions = {
	createGoal: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasName = data.has('name');
		const hasTargetAmount = data.has('targetAmount');

		if (!hasName || !hasTargetAmount) {
			return fail(400, { hasName, hasTargetAmount });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(savingsGoal)
				.values(
					withAuditFieldsForCreate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || null,
							targetAmount: Number(data.get('targetAmount')),
							targetDate: data.get('targetDate')?.toString()
								? localDateToUTCTimestamp(data.get('targetDate')!.toString())
								: null,
							status:
								(data.get('status')?.toString() as 'active' | 'completed' | 'paused') || 'active',
							userId: userId
						},
						userId
					)
				);

			console.log('Created savings goal for user:', userId);
		} catch (error) {
			console.error('Error creating savings goal:', error);
			return fail(500, { error: 'Failed to create savings goal' });
		}

		return { success: true, createGoal: true };
	},

	updateGoal: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');
		const hasName = data.has('name');
		const hasTargetAmount = data.has('targetAmount');

		if (!hasId || !hasName || !hasTargetAmount) {
			return fail(400, { hasId, hasName, hasTargetAmount });
		}

		const goalId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(savingsGoal)
				.set(
					withAuditFieldsForUpdate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || null,
							targetAmount: Number(data.get('targetAmount')),
							targetDate: data.get('targetDate')?.toString()
								? localDateToUTCTimestamp(data.get('targetDate')!.toString())
								: null,
							status:
								(data.get('status')?.toString() as 'active' | 'completed' | 'paused') || 'active'
						},
						userId
					)
				)
				.where(eq(savingsGoal.id, goalId));

			console.log('Updated savings goal:', goalId);
		} catch (error) {
			console.error('Error updating savings goal:', error);
			return fail(500, { error: 'Failed to update savings goal' });
		}

		return { success: true, updateGoal: true };
	},

	deleteGoal: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const goalId = data.get('id')!.toString();
		try {
			// Check if contributions exist for this goal
			const existingContributions = await getDb()
				.select()
				.from(contribution)
				.where(eq(contribution.goalId, goalId));

			if (existingContributions.length > 0) {
				return fail(400, {
					error: `Cannot delete goal. Please delete all ${existingContributions.length} contribution(s) first.`
				});
			}

			// Delete the goal (only if no contributions exist)
			await getDb().delete(savingsGoal).where(eq(savingsGoal.id, goalId));

			console.log('Deleted savings goal:', goalId);
		} catch (error) {
			console.error('Error deleting savings goal:', error);
			return fail(500, { error: 'Failed to delete savings goal' });
		}

		return { success: true, deleteGoal: true };
	},

	createContribution: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasGoalId = data.has('goalId');
		const hasAmount = data.has('amount');
		const hasDate = data.has('date');

		if (!hasGoalId || !hasAmount || !hasDate) {
			return fail(400, { hasGoalId, hasAmount, hasDate });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(contribution)
				.values(
					withAuditFieldsForCreate(
						{
							goalId: data.get('goalId')?.toString() || '',
							amount: Number(data.get('amount')),
							date: localDateToUTCTimestamp(data.get('date')?.toString() || ''),
							description: data.get('description')?.toString() || null,
							userId: userId
						},
						userId
					)
				);

			console.log('Created contribution for user:', userId);
		} catch (error) {
			console.error('Error creating contribution:', error);
			return fail(500, { error: 'Failed to create contribution' });
		}

		return { success: true, createContribution: true };
	},

	updateContribution: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');
		const hasGoalId = data.has('goalId');
		const hasAmount = data.has('amount');
		const hasDate = data.has('date');

		if (!hasId || !hasGoalId || !hasAmount || !hasDate) {
			return fail(400, { hasId, hasGoalId, hasAmount, hasDate });
		}

		const contributionId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(contribution)
				.set(
					withAuditFieldsForUpdate(
						{
							goalId: data.get('goalId')?.toString() || '',
							amount: Number(data.get('amount')),
							date: localDateToUTCTimestamp(data.get('date')?.toString() || ''),
							description: data.get('description')?.toString() || null
						},
						userId
					)
				)
				.where(eq(contribution.id, contributionId));

			console.log('Updated contribution:', contributionId);
		} catch (error) {
			console.error('Error updating contribution:', error);
			return fail(500, { error: 'Failed to update contribution' });
		}

		return { success: true, updateContribution: true };
	},

	deleteContribution: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const contributionId = data.get('id')!.toString();
		try {
			await getDb().delete(contribution).where(eq(contribution.id, contributionId));

			console.log('Deleted contribution:', contributionId);
		} catch (error) {
			console.error('Error deleting contribution:', error);
			return fail(500, { error: 'Failed to delete contribution' });
		}

		return { success: true, deleteContribution: true };
	}
} satisfies Actions;
