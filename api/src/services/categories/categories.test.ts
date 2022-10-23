import {
  categories,
  category,
  createCategory,
  deleteCategory,
  updateCategory
} from './categories';
import type {
  StandardScenario,
  TransactionOnlyScenario
} from './categories.scenarios';

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float and DateTime types.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('categories', () => {
  scenario('returns all categories', async (scenario: StandardScenario) => {
    const result = await categories();
    // const result = await categories({
    //   transactionId: scenario.category.one.transactionId,
    // });

    expect(result.length).toEqual(Object.keys(scenario.category).length);
  });

  scenario('returns a single category', async (scenario: StandardScenario) => {
    const result = await category({ id: scenario.category.one.id });

    expect(result).toEqual(scenario.category.one);
  });

  scenario('creates a category', async (scenario: StandardScenario) => {
    const result = await createCategory({
      input: {
        name: 'String',
        transactionId: scenario.category.two.transactionId,
      },
    });

    expect(result.name).toEqual('String');
    expect(result.transactionId).toEqual(scenario.category.two.transactionId);
    expect(result.updatedAt).toEqual('2022-10-22T23:31:25Z');
  });

  scenario(
    'transactionOnly',
    'creates a new category',
    async (scenario: TransactionOnlyScenario) => {
      const category = await createCategory({
        input: {
          name: 'Groceries',
          transactionId: scenario.transaction.shoe.id,
        },
      });

      expect(category.name).toEqual('Groceries');
      expect(category.transactionId).toEqual(scenario.transaction.shoe.id);
      expect(category.createdAt).not.toEqual(null);
    }
  );

  scenario('updates a category', async (scenario: StandardScenario) => {
    const original = await category({ id: scenario.category.one.id });
    const result = await updateCategory({
      id: original.id,
      input: { name: 'String2' },
    });

    expect(result.name).toEqual('String2');
  });

  scenario('deletes a category', async (scenario: StandardScenario) => {
    const original = await deleteCategory({ id: scenario.category.one.id });
    const result = await category({ id: original.id });

    expect(result).toEqual(null);
  });
});
