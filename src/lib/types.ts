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
	description: string;
	createdAt: string;
	updatedAt: string;
};

export type Transaction = {
	id: string;
	amount: number;
	payee: string;
	notes: string;
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

export type Recurring = {
	id: string;
	merchant: string;
	description: string;
	cadence: 'Monthly' | 'Yearly';
	amount: number;
	user: User;
};

export type DashboardSummary = {
	transactions: Transaction[];
	income: Income[];
	totalTransactions: number;
	totalIncome: number;
};
