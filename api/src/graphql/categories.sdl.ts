export const schema = gql`
  type Category {
    id: Int!
    name: String!
    transaction: Transaction!
    transactionId: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    categories: [Category!]! @requireAuth
    # categories(transactionId: Int!): [Category!]! @requireAuth
    category(id: Int!): Category @requireAuth
  }

  input CreateCategoryInput {
    name: String!
    transactionId: Int!
  }

  input UpdateCategoryInput {
    name: String
    transactionId: Int
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): Category! @requireAuth
    updateCategory(id: Int!, input: UpdateCategoryInput!): Category!
      @requireAuth
    deleteCategory(id: Int!): Category! @requireAuth(roles: "admin")
  }
`;
