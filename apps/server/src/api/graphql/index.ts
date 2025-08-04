import { createSchema, createYoga } from 'graphql-yoga';
import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';

// Create GraphQL schema
const schema = createSchema({
  typeDefs,
  resolvers,
});

// Create GraphQL Yoga server
export const graphqlServer = createYoga({
  schema,
  // GraphQL endpoint will be mounted at /graphql
  graphqlEndpoint: '/graphql',
  // Enable GraphQL Playground in development
  landingPage: true,
  // Enable introspection and playground in development
  context: async (initialContext) => {
    return {
      ...initialContext,
    };
  },
});
