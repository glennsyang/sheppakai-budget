import type { Transaction } from 'types/graphql';

import { useAuth } from '@redwoodjs/auth';
import { Link, routes } from '@redwoodjs/router';
import { useMutation } from '@redwoodjs/web';

import { toCurrency, toDateString } from 'src/utils/utilities';

import CategoryForm from '../CategoryForm/CategoryForm';

const DELETE = gql`
  mutation DeleteTransactionMutation($id: Int!) {
    deleteTransaction(id: $id) {
      id
    }
  }
`;
interface Props {
  expense?: Omit<Transaction, 'createdAt'>;
}
const Expense = ({ expense }: Props) => {
  const { hasRole } = useAuth();
  const [deleteTransaction] = useMutation(DELETE, {
    variables: { id: expense.id },
  });

  const deleteTrans = () => {
    if (confirm('Are you sure?')) {
      deleteTransaction({
        variables: { id: expense.id },
      });
    }
  };

  return (
    <article key={expense.id} className="bg-gray-200 p-8 rounded-lg relative">
      <header>
        <h2 className="text-xl text-blue-700 font-semibold">
          <Link to={routes.expense({ id: expense.id })}>
            {expense.description}
          </Link>
        </h2>
      </header>
      <div className="mt-2 text-gray-900 font-light">
        <div>{toDateString(expense.date)}</div>
        <div>{toCurrency(expense.amount)}</div>
        <div>{expense.type}</div>
      </div>
      <div>
        {hasRole('admin') && (
          <button
            type="button"
            onClick={deleteTrans}
            className="absolute bottom-2 right-2 bg-red-500 text-xs rounded text-white px-2 py-1"
          >
            Delete
          </button>
        )}
      </div>
      <div className="mt-12">
        <CategoryForm transactionId={expense.id} />
      </div>
    </article>
  );
};

export default Expense;
