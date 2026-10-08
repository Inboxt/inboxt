import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';

// Retries network errors (e.g. a dead connection right after resuming from background on mobile).
const retryLink = new RetryLink({
	delay: {
		initial: 300,
		max: 5000,
		jitter: true,
	},
	attempts: {
		max: 4,
		retryIf: (error) => !!error,
	},
});

export const client = new ApolloClient({
	cache: new InMemoryCache({
		possibleTypes: {
			Entry: ['SavedItem', 'Highlight'],
		},
		typePolicies: {
			Query: {
				fields: {
					entries: {
						keyArgs: ['query', ['q', 'sort', ['field', 'direction']]],
						merge(existing, incoming, { args }) {
							if (!args?.query?.after) {
								const incomingEdges: any[] = incoming.edges ?? [];

								// No existing cache — store incoming directly.
								if (!existing?.edges?.length) {
									return incoming;
								}

								// Don't let a flaky background refetch wipe a populated list with an empty page 1.
								if (!incomingEdges.length) {
									return existing;
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

	devtools: {
		enabled: false,
	},

	link: ApolloLink.from([
		retryLink,
		new HttpLink({
			uri: '/api/graphql',
			credentials: 'include',
		}),
	]),
});
