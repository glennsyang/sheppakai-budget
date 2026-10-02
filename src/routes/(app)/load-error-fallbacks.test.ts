import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => {
	const dbError = new Error('database is locked');
	// Every query object answers every method with a rejection, so each load hits its catch block
	// no matter which query it runs first.
	const failingQueries = new Proxy(
		{},
		{ get: () => vi.fn<() => Promise<never>>(async () => Promise.reject(dbError)) }
	);
	return {
		dbError,
		failingQueries,
		loggerError: vi.fn<() => void>()
	};
});

vi.mock('$lib/server/db', () => ({
	getDb: () => {
		throw mockState.dbError;
	}
}));

vi.mock('$lib/server/db/queries', () => ({
	accountQueries: mockState.failingQueries,
	budgetQueries: mockState.failingQueries,
	dashboardPreferenceQueries: mockState.failingQueries,
	recurringQueries: mockState.failingQueries,
	savingsGoalQueries: mockState.failingQueries,
	userQueries: mockState.failingQueries,
	windowCleaningCustomerQueries: mockState.failingQueries,
	windowCleaningJobQueries: mockState.failingQueries
}));

vi.mock('$lib/server/dashboard/summary', () => ({
	loadMonthlyDashboard: async () => Promise.reject(mockState.dbError),
	loadYearlyDashboard: async () => Promise.reject(mockState.dbError)
}));

vi.mock('$lib/server/auth', () => ({ auth: { api: {} } }));
vi.mock('$lib/server/email', () => ({ sendPasswordChangedEmail: vi.fn<() => void>() }));

vi.mock('$lib/server/logger', () => ({
	logger: {
		debug: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		error: mockState.loggerError
	}
}));

import { load as budgetLoad } from './budget/+page.server';
import { load as dashboardLoad } from './dashboard/+page.server';
import { load as profileLoad } from './profile/+page.server';
import { load as recurringLoad } from './recurring/+page.server';
import { load as savingsGoalsLoad } from './savings/goals/+page.server';
import { load as windowCleaningLoad } from './window-cleaning/+page.server';
import { load as windowCleaningJobsLoad } from './window-cleaning/jobs/+page.server';

const sessionUser = { id: 'user-1', name: 'Test User', email: 'user@example.com' };

function event(path: string) {
	const url = new URL(`https://budget.example.com${path}`);
	return { url, locals: { user: sessionUser }, request: new Request(url) } as never;
}

type LoadCase = {
	name: string;
	load: (event: never) => unknown;
	path: string;
	fallback: Record<string, unknown>;
	forms: string[];
};

const cases: LoadCase[] = [
	{
		name: 'budget',
		load: budgetLoad,
		path: '/budget?month=03&year=2026',
		fallback: { budget: [], historicalBudgets: [], historicalTransactions: [], recurring: [] },
		forms: []
	},
	{
		name: 'recurring',
		load: recurringLoad,
		path: '/recurring',
		fallback: { recurrings: [] },
		forms: ['form']
	},
	{
		name: 'dashboard (monthly)',
		load: dashboardLoad,
		path: '/dashboard',
		fallback: { mode: 'monthly', hiddenSections: [] },
		forms: ['dashboardVisibilityForm', 'transactionForm']
	},
	{
		name: 'dashboard (yearly)',
		load: dashboardLoad,
		path: '/dashboard?mode=yearly',
		fallback: { mode: 'yearly', hiddenSections: [] },
		forms: ['dashboardVisibilityForm', 'transactionForm']
	},
	{
		name: 'profile',
		load: profileLoad,
		path: '/profile',
		fallback: { user: sessionUser, passwordUpdatedAt: null },
		forms: ['profileForm', 'passwordForm']
	},
	{
		name: 'savings/goals',
		load: savingsGoalsLoad,
		path: '/savings/goals',
		fallback: { goals: [], contributions: [] },
		forms: ['savingsGoalForm', 'contributionForm']
	},
	{
		name: 'window-cleaning',
		load: windowCleaningLoad,
		path: '/window-cleaning',
		fallback: {
			customers: [],
			totalCustomers: 0,
			jobsThisMonthCount: 0,
			earnedThisMonth: 0,
			earnedThisYear: 0,
			earnedLastYear: 0
		},
		forms: ['customerForm', 'jobForm']
	},
	{
		name: 'window-cleaning/jobs',
		load: windowCleaningJobsLoad,
		path: '/window-cleaning/jobs?year=2025',
		fallback: {
			jobs: [],
			totalCharged: 0,
			totalTips: 0,
			totalEarned: 0,
			earnedLastYear: 0,
			jobCount: 0
		},
		forms: ['jobForm']
	}
];

describe.each(cases)('$name load on a database failure', ({ load, path, fallback, forms }) => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns empty fallbacks and a loadError instead of throwing', async () => {
		const result = (await load(event(path))) as Record<string, unknown>;

		expect(result).toMatchObject(fallback);
		expect(result.loadError).toEqual(expect.stringMatching(/^Failed to load .+ Please try/));
		for (const form of forms) {
			expect(result[form]).toEqual(expect.objectContaining({ id: expect.any(String) }));
		}
	});

	it('logs the underlying error', async () => {
		await load(event(path));

		expect(mockState.loggerError).toHaveBeenCalledWith(
			expect.stringMatching(/^Failed to load /),
			mockState.dbError
		);
	});
});
