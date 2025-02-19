const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Contact {
    id: ID!
    name: String!
    phone: String!
    photo: String
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedContacts {
    contacts: [Contact!]!
    page: Int!
    limit: Int!
    pages: Int!
    total: Int!
  }

  input ContactInput {
    name: String!
    phone: String!
  }

  input PaginationInput {
    page: Int
    limit: Int
    sortBy: String
    sortOrder: String
    search: String
  }

  type Query {
    contacts(pagination: PaginationInput): PaginatedContacts!
    contact(id: ID!): Contact
  }

  type Mutation {
    createContact(input: ContactInput!): Contact!
    updateContact(id: ID!, input: ContactInput!): Contact!
    deleteContact(id: ID!): Contact!
    updateAvatar(id: ID!, photo: String!): Contact!
  }
`);

const resolvers = require('./resolvers');

module.exports = {schema, resolvers};

