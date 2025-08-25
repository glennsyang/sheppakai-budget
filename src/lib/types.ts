// Global type definitions for the budget application

export type User = {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
};

export type Category = {
	id: string;
	name: string;
};

export type Expense = {
	id: string;
	amount: number;
	description: string;
	date: string;
	category: Category | null;
	user: User;
};

export type Income = {
	id: string;
	amount: number;
	description: string;
	date: string;
	user: User;
};

export type Budget = {
	id: string;
	amount: number;
	month: string;
	year: string;
	category: Category | null;
	user: User;
};

export type DashboardSummary = {
	expenses: Expense[];
	income: Income[];
	totalExpenses: number;
	totalIncome: number;
};
