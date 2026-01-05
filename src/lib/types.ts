import type { Icon } from '@lucide/svelte';
import type { Component } from 'svelte';

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

export type Budget = {
	id: string;
	amount: number;
	month: string;
	year: string;
	presetType?: string | null;
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

export type Income = {
	id: string;
	name: string;
	description: string;
	amount: number;
	date: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
};

export type ChartData = {
	date: Date;
	actual: number;
	planned: number;
};

export type SidebarData = {
	navMain: { title: string; url: string; icon?: Component<Icon> }[];
	navSetup: { title: string; url: string; icon?: Component<Icon> }[];
};
