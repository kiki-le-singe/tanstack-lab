import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

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
  landingPage: false,
  // Enable introspection and playground in development
  context: async (initialContext) => {
    return {
      ...initialContext,
    };
  },
});