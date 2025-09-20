import { useDebouncedCallback } from '@mantine/hooks';
import { ReactNode, useState } from 'react';

import { SavedItem, Highlight } from '~lib/graphql/generated/graphql.ts';

import { ContentSelectionContext, SelectableItem } from './ContentSelectionContext';

export const ContentSelectionProvider = ({ children }: { children: ReactNode }) => {
	const [selectedItems, setSelectedItemsRaw] = useState<SelectableItem[]>([]);
	const [visibleItems, setVisibleItemsRaw] = useState<SelectableItem[]>([]);

	const setSelectedItems = (items: (SavedItem | Highlight)[]) => {
		setSelectedItemsRaw(items);
	};

	const setVisibleItems = (items: (SavedItem | Highlight)[]) => {
		setVisibleItemsRaw(items);
	};

	const toggleSelectAll = useDebouncedCallback(() => {
		setSelectedItemsRaw((prev) => {
			const visibleIds = visibleItems.map((item) => item.id);
			const prevIds = prev.map((it) => it.id);

			const allSelected =
				visibleIds.length > 0 && visibleIds.every((id) => prevIds.includes(id));
			if (allSelected) {
				return prev.filter((item) => !visibleIds.includes(item.id));
			}
			const toAdd = visibleItems.filter((item) => !prevIds.includes(item.id));
			return [...prev, ...toAdd];
		});
	}, 10);

	const deselectAll = () => {
		setSelectedItemsRaw([]);
	};

	const toggleItemSelection = useDebouncedCallback((item: SavedItem | Highlight) => {
		setSelectedItemsRaw((prev) => {
			const found = prev.find((it) => it.id === item.id);
			if (found) {
				return prev.filter((it) => it.id !== item.id);
			}
			return [...prev, item];
		});
	}, 10);

	const isSelected = (id: string) => selectedItems.some((item) => item.id === id);

	const visibleIds = visibleItems.map((item) => item.id);
	const selectedIds = selectedItems.map((item) => item.id);

	const isAllSelected =
		visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
	const isNoneSelected = visibleIds.every((id) => !selectedIds.includes(id));
	const isPartiallySelected = !isAllSelected && !isNoneSelected;

	return (
		<ContentSelectionContext.Provider
			value={{
				selectedItems,
				setSelectedItems,
				visibleItems,
				setVisibleItems,
				toggleSelectAll,
				isAllSelected,
				isNoneSelected,
				isPartiallySelected,
				toggleItemSelection,
				isSelected,
				deselectAll,
			}}
		>
			{children}
		</ContentSelectionContext.Provider>
	);
};
