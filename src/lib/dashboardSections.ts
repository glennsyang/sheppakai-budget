type DashboardSectionMode = 'monthly' | 'yearly' | 'both';

export type DashboardSectionDefinition = {
	key: string;
	label: string;
	mode: DashboardSectionMode;
};

const dashboardSections: DashboardSectionDefinition[] = [
	{ key: 'safeToSpendHero', label: 'Safe-to-spend hero band', mode: 'monthly' },
	{ key: 'kpiRow', label: 'KPI sparkline row', mode: 'monthly' },
	{ key: 'monthlyOverview', label: 'Monthly overview & spending breakdown', mode: 'monthly' },
	{ key: 'cashFlowProjection', label: 'Cash flow projection', mode: 'monthly' },
	{ key: 'categoryOverview', label: 'Category overview (top at-risk)', mode: 'monthly' },
	{ key: 'upcomingBills', label: 'Upcoming bills', mode: 'monthly' },
	{ key: 'recurringExpenses', label: 'Recurring expenses', mode: 'monthly' },
	{ key: 'allCategories', label: 'All categories', mode: 'monthly' },
	{ key: 'ytdStats', label: 'Year-to-date stats', mode: 'yearly' },
	{ key: 'netSavingsTable', label: 'Net savings table', mode: 'yearly' },
	{ key: 'trendCharts', label: 'Trend charts', mode: 'yearly' },
	{ key: 'spentByCategory', label: 'Spent by category', mode: 'yearly' },
	{ key: 'goalsStrip', label: 'Savings goals strip', mode: 'both' }
];

export function dashboardSectionsForMode(mode: 'monthly' | 'yearly'): DashboardSectionDefinition[] {
	return dashboardSections.filter((section) => section.mode === mode || section.mode === 'both');
}
