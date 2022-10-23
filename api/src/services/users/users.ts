import type { MutationResolvers, QueryResolvers } from 'types/graphql';

import { requireAuth } from 'src/lib/auth';
import { db } from 'src/lib/db';

export const users: QueryResolvers['users'] = () => {
  return db.user.findMany();
};

export const user: QueryResolvers['user'] = ({ id }) => {
  return db.user.findUnique({
    where: { id },
  });
};

export const createUser: MutationResolvers['createUser'] = ({ input }) => {
  return db.user.create({
    data: input,
  });
};

export const updateUser: MutationResolvers['updateUser'] = ({ id, input }) => {
  return db.user.update({
    data: input,
    where: { id },
  });
};

export const deleteUser: MutationResolvers['deleteUser'] = ({ id }) => {
  requireAuth({ roles: 'admin' });
  return db.user.delete({
    where: { id },
  });
};
