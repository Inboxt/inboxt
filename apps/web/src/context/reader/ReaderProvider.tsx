import { useDebouncedCallback } from '@mantine/hooks';
import React, { useState } from 'react';

import { SavedItem } from '~lib/graphql/generated/graphql.ts';

import { ReaderContext, SelectedSavedItem } from './ReaderContext';

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [selectedItems, setSelectedItemsRaw] = useState<SelectedSavedItem[]>([]);
	const [visibleItems, setVisibleItemsRaw] = useState<SelectedSavedItem[]>([]);

	const toSelectedItem = (item: SavedItem): SelectedSavedItem => {
		return { id: item.id, status: item.status, originalUrl: item.originalUrl };
	};

	const setSelectedItems = (items: SavedItem[]) => {
		setSelectedItemsRaw(items.map(toSelectedItem));
	};

	const setVisibleItems = (items: SavedItem[]) => {
		setVisibleItemsRaw(items.map(toSelectedItem));
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
		setSelectedItems([]);
	};

	const toggleItemSelection = useDebouncedCallback((item: SavedItem) => {
		const minimal = toSelectedItem(item);
		setSelectedItemsRaw((prev) => {
			const found = prev.find((it) => it.id === minimal.id);
			if (found) {
				return prev.filter((it) => it.id !== minimal.id);
			}
			return [...prev, minimal];
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
		<ReaderContext.Provider
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
		</ReaderContext.Provider>
	);
};
