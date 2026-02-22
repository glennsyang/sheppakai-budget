import BriefcaseBusinessIcon from '@lucide/svelte/icons/briefcase-business';
import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
import FolderTreeIcon from '@lucide/svelte/icons/folder-tree';
import FuelIcon from '@lucide/svelte/icons/fuel';
import HouseIcon from '@lucide/svelte/icons/house';
import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank';
import ReceiptIcon from '@lucide/svelte/icons/receipt';
import RepeatIcon from '@lucide/svelte/icons/repeat';
import ShieldIcon from '@lucide/svelte/icons/shield';
import TargetIcon from '@lucide/svelte/icons/target';
import WalletIcon from '@lucide/svelte/icons/wallet';

import type { SidebarData } from '$lib/types';

export const sidebarData: SidebarData = {
	navMain: [
		{
			title: 'Dashboard',
			icon: HouseIcon,
			url: '/dashboard'
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
	navReceipts: [
		{
			title: 'Fuel',
			url: '/receipts/fuel',
			icon: FuelIcon
		},
		{
			title: 'Business',
			url: '/receipts/business',
			icon: BriefcaseBusinessIcon
		}
	],
	navSetup: [
		{
			title: 'Categories',
			url: '/setup/categories',
			icon: FolderTreeIcon
		},
		{
			title: 'Admin',
			url: '/admin',
			icon: ShieldIcon,
			visible: (role: string) => role === 'admin'
		}
	]
};
