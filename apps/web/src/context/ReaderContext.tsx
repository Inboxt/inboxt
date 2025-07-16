import React, { createContext, useContext, useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';

type SelectedItem = { id: number; status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'; originalUrl?: string };

interface ReaderContextProps {
	selectedItems: SelectedItem[];
	setSelectedItems: (items: SelectedItem[]) => void;
	visibleItems: SelectedItem[];
	setVisibleItems: (items: SelectedItem[]) => void;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	isNoneSelected: boolean;
	isPartiallySelected: boolean;
	toggleItemSelection: (item: SelectedItem) => void;
	isSelected: (id: number) => boolean;
	deselectAll: () => void;
}

const ReaderContext = createContext<ReaderContextProps | undefined>(undefined);

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [selectedItems, setSelectedItemsRaw] = useState<SelectedItem[]>([]);
	const [visibleItems, setVisibleItemsRaw] = useState<SelectedItem[]>([]);

	const toSelectedItem = (item: any): SelectedItem => {
		return { id: item.id, status: item.status, originalUrl: item.originalUrl };
	};

	const setSelectedItems = (items: any[]) => {
		setSelectedItemsRaw(items.map(toSelectedItem));
	};

	const setVisibleItems = (items: any[]) => {
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

	const toggleItemSelection = useDebouncedCallback((item: any) => {
		const minimal = toSelectedItem(item);
		setSelectedItemsRaw((prev) => {
			const found = prev.find((it) => it.id === minimal.id);
			if (found) {
				return prev.filter((it) => it.id !== minimal.id);
			}
			return [...prev, minimal];
		});
	}, 10);

	const isSelected = (id: number) => selectedItems.some((item) => item.id === id);

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

export const useReaderContext = () => {
	const context = useContext(ReaderContext);
	if (!context) {
		throw new Error('useReaderContext must be used within a ReaderProvider');
	}
	return context;
};
