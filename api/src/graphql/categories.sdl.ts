export const schema = gql`
  type Category {
    id: Int!
    name: String!
    transactions: [Transaction]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    categories: [Category!]! @requireAuth
    category(id: Int!): Category @requireAuth
  }

  input CreateCategoryInput {
    name: String!
  }

  input UpdateCategoryInput {
    name: String
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): Category! @requireAuth
    updateCategory(id: Int!, input: UpdateCategoryInput!): Category!
      @requireAuth
    deleteCategory(id: Int!): Category! @requireAuth(roles: "admin")
  }
`;
