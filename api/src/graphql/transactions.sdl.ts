export const schema = gql`
  type Transaction {
    id: Int!
    description: String!
    amount: Float!
    date: DateTime!
    type: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    transactions: [Transaction!]! @skipAuth
    transaction(id: Int!): Transaction @skipAuth
  }

  input CreateTransactionInput {
    description: String!
    amount: Float!
    date: DateTime!
    type: String!
  }

  input UpdateTransactionInput {
    description: String
    amount: Float
    date: DateTime
    type: String
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction! @requireAuth
    updateTransaction(id: Int!, input: UpdateTransactionInput!): Transaction!
      @requireAuth
    deleteTransaction(id: Int!): Transaction! @requireAuth
  }
`;
