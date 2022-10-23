import type { ExpensesQuery } from 'types/graphql';

import type { CellFailureProps, CellSuccessProps } from '@redwoodjs/web';

import Expense from 'src/components/Expense/Expense';

export const QUERY = gql`
  query ExpensesQuery {
    expenses: transactions {
      id
      description
      date
      amount
      type
      createdAt
      updatedAt
    }
  }
`;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Empty</div>;

export const Failure = ({ error }: CellFailureProps) => (
  <div style={{ color: 'red' }}>Error: {error.message}</div>
);

export const Success = ({ expenses }: CellSuccessProps<ExpensesQuery>) => {
  return (
    <div className="space-y-10">
      {expenses.map((expense) => (
        <Expense key={expense.id} expense={expense} />
      ))}
    </div>
  );
};
