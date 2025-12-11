import { ApolloClient, InMemoryCache } from '@apollo/client';

export function createApolloClient(graphqlUri: string) {
	return new ApolloClient({
		uri: graphqlUri,
		cache: new InMemoryCache({
			possibleTypes: {
				Entry: ['SavedItem', 'Highlight'],
			},
			typePolicies: {
				Query: {
					fields: {
						entries: {
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
}
