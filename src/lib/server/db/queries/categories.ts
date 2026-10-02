import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder({
	tableName: 'category'
});

export const categoryQueries = {
	...baseBuilder
};
