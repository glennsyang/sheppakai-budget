type DashboardSectionMode = 'monthly' | 'yearly' | 'both';

export type DashboardSectionDefinition = {
	key: string;
	label: string;
	mode: DashboardSectionMode;
};

const dashboardSections: DashboardSectionDefinition[] = [
	{ key: 'safeToSpendHero', label: 'Safe to spend & spending pace', mode: 'monthly' },
	{ key: 'kpiRow', label: 'Key figures', mode: 'monthly' },
	{ key: 'monthlyOverview', label: 'Monthly overview & spending breakdown', mode: 'monthly' },
	{ key: 'cashFlowProjection', label: 'Month-end projection', mode: 'monthly' },
	{ key: 'categoryOverview', label: 'Category overview (top at-risk)', mode: 'monthly' },
	{ key: 'upcomingBills', label: 'Upcoming bills', mode: 'monthly' },
	{ key: 'recurringExpenses', label: 'Recurring expenses', mode: 'monthly' },
	{ key: 'allCategories', label: 'All categories', mode: 'monthly' },
	{ key: 'ytdStats', label: 'Year-to-date figures', mode: 'yearly' },
	{ key: 'netSavingsTable', label: 'Month by month', mode: 'yearly' },
	{ key: 'trendCharts', label: 'Surplus by month chart', mode: 'yearly' },
	{ key: 'spentByCategory', label: 'Spent by category', mode: 'yearly' },
	{ key: 'goalsStrip', label: 'Savings goals strip', mode: 'both' }
];

export function dashboardSectionsForMode(mode: 'monthly' | 'yearly'): DashboardSectionDefinition[] {
	return dashboardSections.filter((section) => section.mode === mode || section.mode === 'both');
}
