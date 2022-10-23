import Expense from './Expense';

export const generated = () => {
  return (
    <Expense
      expense={{
        id: 1,
        amount: 39.98,
        description: 'tomatoes',
        date: '2022-10-01T12:34:56Z',
        type: 'expense',
        updatedAt: new Date().toISOString(),
      }}
    />
  );
};

export default { title: 'Components/Expense' };
