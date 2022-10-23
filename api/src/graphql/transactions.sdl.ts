export const schema = gql`
  type Transaction {
    id: Int!
    description: String!
    amount: Float!
    date: DateTime!
    type: TransactionType!
    category: Category
    categoryId: Int
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TransactionType {
    EXPENSE
    INCOME
  }

  type Query {
    transactions: [Transaction!]! @requireAuth
    transaction(id: Int!): Transaction @requireAuth
  }

  input CreateTransactionInput {
    description: String!
    amount: Float
    date: DateTime!
    type: TransactionType!
    categoryId: Int
  }

  input UpdateTransactionInput {
    description: String
    amount: Float
    date: DateTime
    type: TransactionType
    categoryId: Int
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction! @requireAuth
    updateTransaction(id: Int!, input: UpdateTransactionInput!): Transaction!
      @requireAuth
    deleteTransaction(id: Int!): Transaction! @requireAuth(roles: "admin")
  }
`;
