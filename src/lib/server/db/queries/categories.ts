import type { Category } from '$lib/types';

import { category } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof category, Category>({
	tableName: 'category'
});

export const categoryQueries = {
	...baseBuilder
};
