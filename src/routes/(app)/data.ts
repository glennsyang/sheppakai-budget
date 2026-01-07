import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
import FolderTreeIcon from '@lucide/svelte/icons/folder-tree';
import HouseIcon from '@lucide/svelte/icons/house';
import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
import ReceiptIcon from '@lucide/svelte/icons/receipt';
import RepeatIcon from '@lucide/svelte/icons/repeat';
import TargetIcon from '@lucide/svelte/icons/target';
import WalletIcon from '@lucide/svelte/icons/wallet';

import type { SidebarData } from '$lib/types';

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
		},
		{
			title: 'Recurring',
			url: '/setup/recurring',
			icon: RepeatIcon
		}
	],
	navSavings: [
		{
			title: 'Overview',
			url: '/savings',
			icon: WalletIcon
		},
		{
			title: 'Savings Goals',
			url: '/savings/goals',
			icon: TargetIcon
		}
	],
	navSetup: [
		{
			title: 'Categories',
			url: '/setup/categories',
			icon: FolderTreeIcon
		}
	]
};
