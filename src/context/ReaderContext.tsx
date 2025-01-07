import React, { createContext, useContext, useState } from 'react';
import { useDebouncedCallback } from '@mantine/hooks';

interface ReaderContextProps {
	selectedItemIds: number[];
	setSelectedItemIds: (ids: number[]) => void;
	visibleItemIds: number[];
	setVisibleItemIds: (ids: number[]) => void;
	toggleSelectAll: () => void;
	isAllSelected: boolean;
	isNoneSelected: boolean;
	isPartiallySelected: boolean;
	toggleItemSelection: (id: number) => void;
	isSelected: boolean;
	deselectAll: () => void;
}

const ReaderContext = createContext<ReaderContextProps | undefined>(undefined);

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
	const [visibleItemIds, setVisibleItemIds] = useState<number[]>([]);

	const toggleSelectAll = useDebouncedCallback(() => {
		setSelectedItemIds((prev) => {
			if (visibleItemIds.every((id) => selectedItemIds.includes(id))) {
				return prev.filter((id) => !visibleItemIds.includes(id));
			} else {
				return Array.from(new Set([...prev, ...visibleItemIds]));
			}
		});
	}, 10);

	const deselectAll = () => {
		setSelectedItemIds([]);
	};

	const toggleItemSelection = useDebouncedCallback((id: number) => {
		setSelectedItemIds((prev) =>
			prev.includes(id)
				? prev.filter((itemId) => itemId !== id)
				: [...prev, id],
		);
	}, 10);

	const isAllSelected =
		visibleItemIds.length > 0 &&
		visibleItemIds.every((id) => selectedItemIds.includes(id));
	const isNoneSelected = visibleItemIds.every(
		(id) => !selectedItemIds.includes(id),
	);
	const isPartiallySelected = !isAllSelected && !isNoneSelected;

	return (
		<ReaderContext.Provider
			value={{
				selectedItemIds,
				setSelectedItemIds,
				visibleItemIds,
				setVisibleItemIds,
				toggleSelectAll,
				isAllSelected,
				isNoneSelected,
				isPartiallySelected,
				toggleItemSelection,
				isSelected: isAllSelected || isPartiallySelected,
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
		throw new Error(
			'useReaderContext must be used within a ReaderProvider',
		);
	}
	return context;
};
