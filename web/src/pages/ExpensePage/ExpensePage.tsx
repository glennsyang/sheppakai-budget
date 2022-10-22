import { MetaTags } from '@redwoodjs/web';

import ExpenseCell from 'src/components/ExpenseCell';

interface Props {
  id: number;
}

const ExpensePage = ({ id }: Props) => {
  return (
    <>
      <MetaTags title="Expense" description="Expense page" />

      <ExpenseCell id={id} rand={Math.random()} />
    </>
  );
};

export default ExpensePage;
