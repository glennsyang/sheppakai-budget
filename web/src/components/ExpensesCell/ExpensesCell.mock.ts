// Define your own mock data here:
export const standard = (/* vars, { ctx, req } */) => ({
  expenses: [
    {
      id: 42,
      amount: 39.98,
      description: 'tomatoes',
      date: '2022-10-01T12:34:56Z',
      type: 'expense',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 43,
      amount: 99.97,
      description: 'shoes',
      date: '2022-10-10T12:34:56Z',
      type: 'expense',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
});
