import { desc, eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { contributionSchema, deleteSchema, savingsGoalSchema } from '$lib/formSchemas/savings';
import { createAction, deleteAction, updateAction } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { savingsGoalQueries } from '$lib/server/db/queries';
import { contribution, savingsGoal } from '$lib/server/db/schema';
import { formatDateForStorage } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { goals: [], contributions: [] };
	}

	// Fetch all goals
	const goals = await savingsGoalQueries.findAll();

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
	createGoal: createAction({
		schema: savingsGoalSchema,
		table: savingsGoal,
		entityName: 'Savings goal',
		transformCreate: (data, userId) => ({
			name: data.name,
			description: data.description || null,
			targetAmount: data.targetAmount,
			targetDate: data.targetDate ? formatDateForStorage(data.targetDate) : null,
			status: (data.status as 'active' | 'completed' | 'paused') || 'active',
			userId
		})
	}),

	updateGoal: updateAction({
		schema: savingsGoalSchema,
		table: savingsGoal,
		entityName: 'Savings goal',
		transformUpdate: (data) => ({
			name: data.name,
			description: data.description || null,
			targetAmount: data.targetAmount,
			targetDate: data.targetDate ? formatDateForStorage(data.targetDate) : null,
			status: data.status || 'active'
		})
	}),

	deleteGoal: deleteAction({
		table: savingsGoal,
		entityName: 'Savings goal',
		deleteSchema: deleteSchema,
		beforeDelete: async (id) => {
			// Check if contributions exist for this goal
			const existingContributions = await getDb()
				.select()
				.from(contribution)
				.where(eq(contribution.goalId, id));

			if (existingContributions.length > 0) {
				return {
					error: `Cannot delete goal. Please delete all ${existingContributions.length} contribution(s) first.`
				};
			}
		}
	}),

	createContribution: createAction({
		schema: contributionSchema,
		table: contribution,
		entityName: 'Contribution',
		transformCreate: (data, userId) => ({
			goalId: data.goalId,
			amount: data.amount,
			date: formatDateForStorage(data.date),
			description: data.description || null,
			userId
		})
	}),

	updateContribution: updateAction({
		schema: contributionSchema,
		table: contribution,
		entityName: 'Contribution',
		transformUpdate: (data) => ({
			goalId: data.goalId,
			amount: data.amount,
			date: formatDateForStorage(data.date),
			description: data.description || null
		})
	}),

	deleteContribution: deleteAction({
		table: contribution,
		entityName: 'Contribution',
		deleteSchema: deleteSchema
	})
};
