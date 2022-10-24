import { TransactionType } from 'types/graphql';

// Define your own mock data here:
export const standard = (/* vars, { ctx, req } */) => ({
  expense: {
    id: 42,
    amount: 39.98,
    description: 'tomatoes',
    date: '2022-10-01T12:34:56Z',
    type: 'EXPENSE' as TransactionType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});
