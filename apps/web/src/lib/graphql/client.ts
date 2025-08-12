import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
	uri: `${process.env.API_URL as string}/graphql`,
	cache: new InMemoryCache(),
	credentials: 'include',
});
