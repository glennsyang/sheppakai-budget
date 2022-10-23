import type {
  CreateCategoryMutation,
  CreateCategoryMutationVariables
} from 'types/graphql';

import CategoryForm from './CategoryForm';

export const generated = (args) => {
  mockGraphQLMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(
    'CreateCategoryMutation',
    (variables, { ctx }) => {
      const id = Math.floor(Math.random() * 1000);
      ctx.delay(1000);

      return {
        createCategory: {
          id,
          name: variables.input.name,
          createdAt: new Date().toISOString(),
        },
      };
    }
  );

  return <CategoryForm {...args} />;
};

export default { title: 'Components/CategoryForm' };
