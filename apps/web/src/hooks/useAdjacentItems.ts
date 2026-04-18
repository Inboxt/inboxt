import { useMemo } from 'react';

import { useContentSelection } from '~context/content-selection';

export const useAdjacentItems = (currentId: string | undefined) => {
	const { visibleItems } = useContentSelection();

	return useMemo(() => {
		if (!currentId) {
			return { nextId: null, prevId: null };
		}

		const currentIndex = visibleItems.findIndex((i) => {
			if (i.__typename === 'SavedItem') {
				return i.id === currentId;
			}

			if (i.__typename === 'Highlight') {
				return i.savedItem?.id === currentId;
			}

			return false;
		});

		if (currentIndex === -1) {
			return { nextId: null, prevId: null };
		}

		// Find next item with a different ID
		let nextId: string | null = null;
		for (let i = currentIndex + 1; i < visibleItems.length; i++) {
			const item = visibleItems[i];
			const itemId =
				item.__typename === 'SavedItem'
					? item.id
					: item.__typename === 'Highlight'
						? item.savedItem?.id
						: null;
			if (itemId && itemId !== currentId) {
				nextId = itemId;
				break;
			}
		}

		// Find previous item with a different ID
		let prevId: string | null = null;
		for (let i = currentIndex - 1; i >= 0; i--) {
			const item = visibleItems[i];
			const itemId =
				item.__typename === 'SavedItem'
					? item.id
					: item.__typename === 'Highlight'
						? item.savedItem?.id
						: null;
			if (itemId && itemId !== currentId) {
				prevId = itemId;
				break;
			}
		}

		return { nextId, prevId };
	}, [visibleItems, currentId]);
};
