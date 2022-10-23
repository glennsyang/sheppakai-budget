import type {
  CategoryResolvers,
  MutationResolvers,
  QueryResolvers
} from 'types/graphql';

import { requireAuth } from 'src/lib/auth';
import { db } from 'src/lib/db';

export const categories: QueryResolvers['categories'] = () => {
  return db.category.findMany({});
};

// export const categories = ({
//   transactionId,
// }: Required<Pick<Prisma.CategoryWhereInput, 'transactionId'>>) => {
//   return db.category.findMany({ where: { transactionId } });
// };

export const category: QueryResolvers['category'] = ({ id }) => {
  return db.category.findUnique({
    where: { id },
  });
};

export const createCategory: MutationResolvers['createCategory'] = ({
  input,
}) => {
  return db.category.create({
    data: input,
  });
};

export const updateCategory: MutationResolvers['updateCategory'] = ({
  id,
  input,
}) => {
  return db.category.update({
    data: input,
    where: { id },
  });
};

export const deleteCategory: MutationResolvers['deleteCategory'] = ({ id }) => {
  requireAuth({ roles: 'admin' });
  return db.category.delete({
    where: { id },
  });
};

export const Category: CategoryResolvers = {
  transaction: (_obj, { root }) =>
    db.category.findUnique({ where: { id: root.id } }).transaction(),
};
