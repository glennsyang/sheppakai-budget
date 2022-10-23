import type { ExpenseQuery } from 'types/graphql';

import type { CellFailureProps, CellSuccessProps } from '@redwoodjs/web';

import Expense from 'src/components/Expense/Expense';

export const QUERY = gql`
  query ExpenseQuery($id: Int!) {
    expense: transaction(id: $id) {
      id
      description
      amount
      date
      type
      category {
        name
      }
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

export const Success = ({ expense }: CellSuccessProps<ExpenseQuery>) => {
  return <Expense expense={expense} />;
};
