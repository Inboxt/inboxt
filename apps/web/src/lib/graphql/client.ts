import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
	uri: `${process.env.API_URL as string}/graphql`,
	cache: new InMemoryCache({
		possibleTypes: {
			Entry: ['SavedItem', 'Highlight'],
		},
		typePolicies: {
			Query: {
				fields: {
					entries: {
						// Key cache by search and sort only; ignore pagination args
						keyArgs: (args) => {
							const q = args?.query?.q ?? null;
							const sort = args?.query?.sort ?? null;
							const field = sort?.field ?? null;
							const direction = sort?.direction ?? null;
							return ['entries', q, field, direction];
						},
						merge(existing, incoming, { args }) {
							if (!args?.query?.after) {
								return incoming;
							}

							const existingEdges = existing?.edges ?? [];
							const seen = new Set(existingEdges.map((e: any) => e.cursor));
							const mergedEdges = [...existingEdges];

							for (const edge of incoming.edges ?? []) {
								if (!seen.has(edge.cursor)) {
									seen.add(edge.cursor);
									mergedEdges.push(edge);
								}
							}

							return {
								__typename: incoming.__typename ?? 'EntryConnection',
								edges: mergedEdges,
								pageInfo: incoming.pageInfo,
							};
						},
					},
				},
			},
		},
	}),
	credentials: 'include',
});
