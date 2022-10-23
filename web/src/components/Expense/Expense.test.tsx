
import { render, screen } from '@redwoodjs/testing';

import { toCurrency } from 'src/utils/utilities';

import Expense from './Expense';

describe('Expense', () => {
  it('renders a blog post', () => {
    const expense = {
      id: 1,
      amount: 39.98,
      description: 'tomatoes',
      date: '2022-10-01T12:34:56Z',
      type: 'EXPENSE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    render(<Expense expense={expense} />);

    expect(screen.getByText(toCurrency(expense.amount))).toBeInTheDocument();
    expect(screen.getByText(expense.description)).toBeInTheDocument();
  });
});
