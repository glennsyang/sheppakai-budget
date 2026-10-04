import { renderComponent } from '$lib/components/ui/data-table/index.js';
import type { ComponentProps } from 'svelte';

import CategoryCell from './CategoryCell.svelte';
import MoneyCell from './MoneyCell.svelte';
import StackCell from './StackCell.svelte';
import StatusBadge from './StatusBadge.svelte';
import TagList from './TagList.svelte';

export const moneyCell = (
	value: number,
	options: Omit<ComponentProps<typeof MoneyCell>, 'value'> = {}
) => renderComponent(MoneyCell, { value, ...options });

export const stackCell = (primary: string, secondary?: string | null, mono = false) =>
	renderComponent(StackCell, { primary, secondary, mono });

export const badgeCell = (props: ComponentProps<typeof StatusBadge>) =>
	renderComponent(StatusBadge, props);

export const categoryCell = (name: string, color?: string) =>
	renderComponent(CategoryCell, { name, color });

export const tagListCell = (tags: string[]) => renderComponent(TagList, { tags });
