import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
	uri: '/api/graphql',
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
								const incomingEdges: any[] = incoming.edges ?? [];

								// No existing cache, or the server returned an empty page —
								// store incoming directly without preserving anything.
								if (!existing?.edges?.length || !incomingEdges.length) {
									return incoming;
								}

								// Cursors present in the new page-1 response.
								const incomingCursors = new Set(
									incomingEdges.map((e: any) => e.cursor),
								);

								// Only preserve pages 2+ when incoming is genuinely page 1 of
								// the same dataset — proven by at least one cursor overlapping.
								// If there is no overlap the view has changed entirely (different
								// filter, items deleted, etc.) and we must not preserve old data.
								const hasOverlap = (existing.edges as any[]).some((e) =>
									incomingCursors.has(e.cursor),
								);

								if (!hasOverlap) {
									return incoming;
								}

								// Edges that were NOT in the fresh page 1 are pages 2+.
								// Keep them so the virtualised list doesn't shrink on remount.
								const trailingEdges = (existing.edges as any[]).filter(
									(e) => !incomingCursors.has(e.cursor),
								);

								return {
									__typename: incoming.__typename ?? 'EntryConnection',
									edges: [...incomingEdges, ...trailingEdges],
									// Keep existing pageInfo when trailing pages are present so
									// endCursor still points to the actual last loaded item.
									pageInfo:
										trailingEdges.length > 0
											? existing.pageInfo
											: incoming.pageInfo,
								};
							}

							// Cursor-based fetch (page 2+) — deduplicate and append.
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
	devtools: {
		enabled: false,
	},
});
