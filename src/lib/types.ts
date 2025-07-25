// Global type definitions for the budget application

export type User = {
	id: number;
	email: string;
	firstName: string | null;
	lastName: string | null;
};

export type Category = {
	id: number;
	name: string;
};

export type Expense = {
	id: number;
	amount: number;
	description: string;
	date: string;
	category: Category | null;
	user: User;
};

export type Income = {
	id: number;
	amount: number;
	description: string;
	date: string;
	user: User;
};

export type DashboardSummary = {
	expenses: Expense[];
	income: Income[];
	totalExpenses: number;
	totalIncome: number;
};
