import { ApolloCache } from '@apollo/client';

import { SavedItem } from './generated/graphql';

export const updateEntriesCacheForReadStatus = (cache: ApolloCache, updatedItems: SavedItem[]) => {
	const ids = updatedItems.map((item) => item.id);

	cache.modify({
		fields: {
			entries(existing: any, { readField, args }: any) {
				if (!existing || !existing.edges) {
					return existing;
				}

				const query = args?.query?.q || '';
				const hasUnread = /\bis:unread\b/.test(query);
				const hasRead = /\bis:read\b/.test(query);

				if (!hasUnread && !hasRead) {
					return existing;
				}

				const newEdges = existing.edges.filter((edge: any) => {
					const node = readField('node', edge);
					if (!node) {
						return false;
					}
					const nodeId = readField('id', node) as string;
					if (!ids.includes(nodeId)) {
						return true;
					}

					const readAt = readField('readAt', node);
					const isRead = !!readAt;

					if (hasUnread && isRead) {
						return false;
					}
					if (hasRead && !isRead) {
						return false;
					}

					return true;
				});

				return newEdges.length === existing.edges.length
					? existing
					: { ...existing, edges: newEdges };
			},
		},
	});
};
