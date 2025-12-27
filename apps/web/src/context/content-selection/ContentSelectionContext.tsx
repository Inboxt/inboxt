import { createContext, useContext } from 'react';

import { SavedItem, Highlight } from '~lib/graphql';

export type SelectableItem = SavedItem | Highlight;

interface ContentSelectionContextProps {
	selectedItems: SelectableItem[];
	setSelectedItems: (items: SelectableItem[]) => void;
	visibleItems: SelectableItem[];
	setVisibleItems: (items: SelectableItem[]) => void;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	isNoneSelected: boolean;
	isPartiallySelected: boolean;
	toggleItemSelection: (item: SelectableItem) => void;
	isSelected: (id: string) => boolean;
	deselectAll: () => void;
}

export const ContentSelectionContext = createContext<ContentSelectionContextProps | undefined>(
	undefined,
);

export const useContentSelection = () => {
	const context = useContext(ContentSelectionContext);
	if (!context) {
		throw new Error('useContentSelection must be used within a ContentSelectionProvider');
	}
	return context;
};
