import {
  createTransaction,
  deleteTransaction,
  transaction,
  transactions,
  updateTransaction
} from './transactions';
import type { StandardScenario } from './transactions.scenarios';

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('transactions', () => {
  scenario('returns all transactions', async (scenario: StandardScenario) => {
    const result = await transactions();

    expect(result.length).toEqual(Object.keys(scenario.transaction).length);
  });

  scenario(
    'returns a single transaction',
    async (scenario: StandardScenario) => {
      const result = await transaction({ id: scenario.transaction.one.id });

      expect(result).toEqual(scenario.transaction.one);
    }
  );

  scenario('creates a transaction', async () => {
    const result = await createTransaction({
      input: {
        description: 'String',
        amount: 2960087.3908603773,
        date: '2022-09-05T06:32:51Z',
        type: 'String',
        updatedAt: '2022-09-05T06:32:51Z',
      },
    });

    expect(result.description).toEqual('String');
    expect(result.amount).toEqual(2960087.3908603773);
    expect(result.date).toEqual('2022-09-05T06:32:51Z');
    expect(result.type).toEqual('String');
    expect(result.updatedAt).toEqual('2022-09-05T06:32:51Z');
  });

  scenario('updates a transaction', async (scenario: StandardScenario) => {
    const original = await transaction({ id: scenario.transaction.one.id });
    const result = await updateTransaction({
      id: original.id,
      input: { description: 'String2' },
    });

    expect(result.description).toEqual('String2');
  });

  scenario('deletes a transaction', async (scenario: StandardScenario) => {
    const original = await deleteTransaction({
      id: scenario.transaction.one.id,
    });
    const result = await transaction({ id: original.id });

    expect(result).toEqual(null);
  });
});
