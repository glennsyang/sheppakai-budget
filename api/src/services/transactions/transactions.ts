import type {
  MutationResolvers,
  QueryResolvers,
  TransactionResolvers
} from 'types/graphql';

import { db } from 'src/lib/db';

export const transactions: QueryResolvers['transactions'] = () => {
  return db.transaction.findMany();
};

export const transaction: QueryResolvers['transaction'] = ({ id }) => {
  return db.transaction.findUnique({
    where: { id },
  });
};

export const createTransaction: MutationResolvers['createTransaction'] = ({
  input,
}) => {
  return db.transaction.create({
    data: input,
  });
};

export const updateTransaction: MutationResolvers['updateTransaction'] = ({
  id,
  input,
}) => {
  return db.transaction.update({
    data: input,
    where: { id },
  });
};

export const deleteTransaction: MutationResolvers['deleteTransaction'] = ({
  id,
}) => {
  return db.transaction.delete({
    where: { id },
  });
};

export const Transaction: TransactionResolvers = {
  category: (_obj, { root }) =>
    db.transaction.findUnique({ where: { id: root.id } }).category(),
};
