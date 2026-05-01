import { useMemo } from 'react';

import { SelectableItem, useContentSelection } from '~context/content-selection';

const getSavedItemId = (item: SelectableItem | undefined): string | null => {
	if (!item) {
		return null;
	}

	if (item.__typename === 'SavedItem') {
		return item.id;
	}

	if ('savedItem' in item) {
		return item.savedItem?.id ?? null;
	}

	return null;
};

export const useAdjacentItems = (currentId: string | undefined) => {
	const { visibleItems } = useContentSelection();

	return useMemo(() => {
		if (!currentId) {
			return { nextId: null, prevId: null };
		}

		const currentIndex = visibleItems.findIndex((item) => getSavedItemId(item) === currentId);

		if (currentIndex === -1) {
			return { nextId: null, prevId: null };
		}

		// Find next item with a different ID
		let nextId: string | null = null;
		for (let i = currentIndex + 1; i < visibleItems.length; i++) {
			const itemId = getSavedItemId(visibleItems[i]);
			if (itemId && itemId !== currentId) {
				nextId = itemId;
				break;
			}
		}

		// Find previous item with a different ID
		let prevId: string | null = null;
		for (let i = currentIndex - 1; i >= 0; i--) {
			const itemId = getSavedItemId(visibleItems[i]);
			if (itemId && itemId !== currentId) {
				prevId = itemId;
				break;
			}
		}

		return { nextId, prevId };
	}, [visibleItems, currentId]);
};
