import type { Transaction } from 'types/graphql';

import { Link, routes } from '@redwoodjs/router';

interface Props {
  expense: Transaction;
}
const Expense = ({ expense }: Props) => {
  return (
    <article key={expense.id}>
      <header>
        <h2>
          <Link to={routes.expense({ id: expense.id })}>
            {expense.description}
          </Link>
        </h2>
      </header>
      <div>{expense.date}</div>
      <div>{expense.amount}</div>
      <div>Posted at: {expense.createdAt}</div>
    </article>
  );
};

export default Expense;
