import type { SidebarData } from '$lib/types';
import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
import HouseIcon from '@lucide/svelte/icons/house';
import ReceiptIcon from '@lucide/svelte/icons/receipt';
import FolderTreeIcon from '@lucide/svelte/icons/folder-tree';
import RepeatIcon from '@lucide/svelte/icons/repeat';

export const sidebarData: SidebarData = {
	navMain: [
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: HouseIcon
		},
		{
			title: 'Transactions',
			url: '/finances/transactions',
			icon: ReceiptIcon
		},
		{
			title: 'Budget',
			url: '/finances/budget',
			icon: PiggyBankIcon
		},
		{
			title: 'Income',
			url: '/finances/income',
			icon: DollarSignIcon
		}
	],
	navSetup: [
		{
			title: 'Categories',
			url: '/setup/categories',
			icon: FolderTreeIcon
		},
		{
			title: 'Recurring',
			url: '/setup/recurring',
			icon: RepeatIcon
		}
	]
};
