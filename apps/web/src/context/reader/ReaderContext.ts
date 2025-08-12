import { createContext, useContext } from 'react';

import { SavedItem } from '~lib/graphql/generated/graphql.ts';

export type SelectedSavedItem = {
	id: string;
	status: SavedItem['status'];
	originalUrl?: string | null;
};

interface ReaderContextProps {
	selectedItems: SelectedSavedItem[];
	setSelectedItems: (items: SavedItem[]) => void;
	visibleItems: SelectedSavedItem[];
	setVisibleItems: (items: SavedItem[]) => void;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	isNoneSelected: boolean;
	isPartiallySelected: boolean;
	toggleItemSelection: (item: SavedItem) => void;
	isSelected: (id: string) => boolean;
	deselectAll: () => void;
}

export const ReaderContext = createContext<ReaderContextProps | undefined>(undefined);
export const useReaderContext = () => {
	const context = useContext(ReaderContext);
	if (!context) {
		throw new Error('useReaderContext must be used within a ReaderProvider');
	}
	return context;
};
