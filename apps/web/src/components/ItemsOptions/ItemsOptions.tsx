import { useMutation } from '@apollo/client';
import { ActionIcon, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconArrowBackUp,
	IconCopy,
	IconDots,
	IconEraser,
	IconFileText,
	IconProps,
	IconTag,
	IconTrash,
	IconTrashX,
	IconWorld,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo } from 'react';

import { ConfirmWithAlert } from '~components/ConfirmWithAlert';
import { toastSuccess } from '~components/Toast';
import { SelectableItem, useContentSelection } from '~context/content-selection';
import {
	PERMANENTLY_DELETE_SAVED_ITEMS,
	UPDATE_SAVED_ITEM_STATUS,
	DELETE_HIGHLIGHTS,
	ENTRIES,
	ACTIVE_USER,
} from '~lib/graphql';
import { SavedItem, SavedItemStatus, Highlight } from '~lib/graphql';
import { modals } from '~modals/modals';

import { MenuDrawer } from '../MenuDrawer';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';

export type ItemsOptionsMode = 'single' | 'bulk' | 'reader' | 'reader-menu' | 'highlights';

type ItemsOptionsProps = {
	items: SelectableItem[];
	mode: ItemsOptionsMode;
	size?: 'sm' | 'md';
	onActionComplete?: () => void | Promise<void>;
};

type Option = {
	label: string;
	icon: React.ComponentType<IconProps>;
	modes: ItemsOptionsMode[];
	visible?: () => boolean;
	onClick: () => boolean | Promise<boolean | undefined> | undefined;
	clearsSelection?: boolean;
	runsOnActionComplete?: boolean;
};

type SavedSelectable = Extract<SelectableItem, { __typename: 'SavedItem' }>;
type HighlightSelectable = Extract<SelectableItem, { __typename: 'Highlight' }>;

export const ItemsOptions = ({ items, mode, size = 'md', onActionComplete }: ItemsOptionsProps) => {
	const isSmall = size === 'sm';
	const [updateStatus, { loading: updateLoading }] = useMutation(UPDATE_SAVED_ITEM_STATUS, {
		refetchQueries: [ENTRIES],
	});
	const [deleteHighlights, { loading: deleteLoading }] = useMutation(DELETE_HIGHLIGHTS, {
		refetchQueries: [ENTRIES, ACTIVE_USER],
	});
	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		refetchQueries: [ENTRIES, ACTIVE_USER],
	});
	const { setSelectedItems } = useContentSelection();
	const navigate = useNavigate();
	const loading = updateLoading || deleteLoading;

	const savedItems: SavedItem[] = useMemo(
		() => items.filter((i): i is SavedSelectable => i.__typename === 'SavedItem'),
		[items],
	);
	const highlightItems: Highlight[] = useMemo(
		() => items.filter((i): i is HighlightSelectable => i.__typename === 'Highlight'),
		[items],
	);

	const getSavedItemIds = (list: SavedItem[], predicate: (status: SavedItemStatus) => boolean) =>
		list.filter((i) => predicate(i.status)).map((i) => i.id);

	const confirm = (opts: {
		title: string;
		message: string[];
		confirmLabel?: string;
		confirmColor?: string;
	}) =>
		new Promise<boolean>((resolve) => {
			modals.openConfirmModal({
				title: opts.title,
				centered: true,
				children: <ConfirmWithAlert lines={opts.message} />,
				labels: { confirm: opts.confirmLabel ?? 'Confirm', cancel: 'Cancel' },
				confirmProps: { color: opts.confirmColor ?? 'primary' },
				onConfirm: () => resolve(true),
				onCancel: () => resolve(false),
			});
		});

	const createUndoAction = (
		affectedIds: string[],
		previousById: Map<string, SavedItemStatus>,
	) => ({
		label: 'Undo',
		onClick: async () => {
			const idsByStatus: Record<SavedItemStatus, string[]> = {
				[SavedItemStatus.Active]: [],
				[SavedItemStatus.Archived]: [],
				[SavedItemStatus.Deleted]: [],
			};

			for (const id of affectedIds) {
				const prev = previousById.get(id);
				if (prev) {
					idsByStatus[prev].push(id);
				}
			}

			const ops: Promise<unknown>[] = [];
			for (const status of Object.values(SavedItemStatus)) {
				const ids = idsByStatus[status];
				if (ids?.length) {
					ops.push(
						updateStatus({
							variables: { data: { ids, status: status } },
						}),
					);
				}
			}

			if (ops.length) {
				await Promise.all(ops);
			}
		},
	});

	const OPTIONS: Option[] = [
		{
			label: 'Edit labels',
			icon: IconTag,
			modes: ['single', 'reader', 'reader-menu'],
			clearsSelection: false,
			runsOnActionComplete: false,
			visible: () =>
				savedItems.length === 1 && savedItems[0]?.status !== SavedItemStatus.Deleted,
			onClick: () => {
				const [item] = savedItems;
				if (item) {
					modals.openLabelsSelectionModal({
						itemId: item.id,
						onClose: () => {
							setSelectedItems([]);
						},
					});
				}
				return undefined;
			},
		},
		{
			label: 'Restore',
			icon: IconArrowBackUp,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: () =>
				savedItems.length > 0 &&
				savedItems.some((i) => i.status !== SavedItemStatus.Active),
			onClick: async () => {
				const savedItemIds = getSavedItemIds(
					savedItems,
					(s) => s !== SavedItemStatus.Active,
				);

				if (savedItemIds.length === 0) {
					return undefined;
				}

				await updateStatus({
					variables: {
						data: { ids: savedItemIds, status: SavedItemStatus.Active },
					},
				});

				toastSuccess({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were restored.`
							: 'Item was restored.',
				});

				return undefined;
			},
		},
		{
			label: 'Move to archive',
			icon: IconArchive,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: () =>
				savedItems.length > 0 &&
				savedItems.some((i) => i.status !== SavedItemStatus.Archived),
			onClick: async () => {
				const savedItemIds = getSavedItemIds(
					savedItems,
					(s) => s !== SavedItemStatus.Archived,
				);

				if (savedItemIds.length === 0) {
					return undefined;
				}

				const previousById = new Map(savedItems.map((i) => [i.id, i.status]));

				await updateStatus({
					variables: {
						data: { ids: savedItemIds, status: SavedItemStatus.Archived },
					},
				});

				toastSuccess({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were archived.`
							: 'Item was archived.',
					action: createUndoAction(savedItemIds, previousById),
				});

				return undefined;
			},
		},
		{
			label: 'Move to trash',
			icon: IconTrash,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: () =>
				savedItems.length > 0 &&
				savedItems.some((i) => i.status !== SavedItemStatus.Deleted),
			onClick: async () => {
				const savedItemIds = getSavedItemIds(
					savedItems,
					(s) => s !== SavedItemStatus.Deleted,
				);

				if (savedItemIds.length === 0) {
					return undefined;
				}

				const previousById = new Map(savedItems.map((i) => [i.id, i.status]));

				await updateStatus({
					variables: {
						data: { ids: savedItemIds, status: SavedItemStatus.Deleted },
					},
				});

				toastSuccess({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were moved to trash.`
							: 'Item was moved to trash.',
					action: createUndoAction(savedItemIds, previousById),
				});

				return undefined;
			},
		},
		{
			label: 'Delete permanently',
			icon: IconTrashX,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: () =>
				savedItems.length > 0 &&
				savedItems.some((i) => i.status === SavedItemStatus.Deleted),
			onClick: async () => {
				const savedItemIds = getSavedItemIds(
					savedItems,
					(s) => s === SavedItemStatus.Deleted,
				);
				if (savedItemIds.length === 0) {
					return undefined;
				}

				const count = savedItemIds.length;
				const confirmed = await confirm({
					title: 'Delete Permanently',
					message: [
						`Are you sure you want to permanently delete ${count > 1 ? `${count} items` : 'this item'}?`,
						'This action cannot be undone.',
					],
					confirmLabel: 'Delete permanently',
					confirmColor: 'red',
				});
				if (!confirmed) {
					return false;
				}

				await permanentlyDeleteSavedItems({
					variables: { data: { ids: savedItemIds } },
				});

				toastSuccess({
					title:
						count > 1
							? `${count} items were deleted permanently`
							: 'Item was deleted permanently',
				});

				return true;
			},
		},
		{
			label: 'Open original',
			icon: IconWorld,
			modes: ['single'],
			visible: () => savedItems.length === 1 && Boolean(savedItems[0]?.originalUrl),
			onClick: () => {
				const [item] = savedItems;
				if (item?.originalUrl) {
					window.open(item.originalUrl, '_blank', 'noopener,noreferrer');
				}
				return undefined;
			},
		},
		{
			label: 'Copy Highlight',
			icon: IconCopy,
			modes: ['highlights'],
			visible: () => highlightItems.length === 1,
			onClick: async () => {
				const [highlight] = highlightItems;
				if (highlight && highlight.segments?.length) {
					const text = highlight.segments
						.slice()
						.reverse()
						.map((s) => s.text)
						.join('')
						.replace(/\s+/g, ' ')
						.trim();

					await navigator.clipboard.writeText(text);
				}

				return undefined;
			},
		},
		{
			label: 'Delete highlight',
			icon: IconEraser,
			modes: ['highlights'],
			visible: () => highlightItems.length > 0,
			onClick: async () => {
				if (highlightItems.length === 0) {
					return undefined;
				}

				const count = highlightItems.length;
				const confirmed = await confirm({
					title: `Delete Highlight${count > 1 ? 's' : ''}`,
					message: [
						`Are you sure you want to permanently delete ${count > 1 ? `${count} highlights` : 'this highlight'}?`,
						'This action cannot be undone.',
					],
					confirmLabel: 'Delete permanently',
					confirmColor: 'red',
				});

				if (!confirmed) {
					return false;
				}

				await deleteHighlights({
					variables: {
						data: {
							items: highlightItems.map((item) => ({
								id: item.id,
								savedItemId: item.savedItem?.id || null,
							})),
						},
					},
				});

				toastSuccess({
					title:
						count > 1
							? `${count} highlights were deleted permanently`
							: 'Highlight was deleted permanently',
				});

				return true;
			},
		},
		{
			label: 'Open source',
			icon: IconFileText,
			modes: ['highlights'],
			visible: () => highlightItems.length === 1 && Boolean(highlightItems[0]?.savedItem?.id),
			onClick: async () => {
				const [highlight] = highlightItems;
				if (highlight?.savedItem?.id) {
					await navigate({ to: '/r/$id', params: { id: highlight.savedItem.id } });
					return undefined;
				}

				return undefined;
			},
		},
	];

	const handleOptionClick = async (option: Option, e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (option.clearsSelection ?? true) {
			setSelectedItems([]);
		}

		const result = await option.onClick();
		if (result !== false && (option.runsOnActionComplete ?? true) && onActionComplete) {
			await onActionComplete();
		}
	};

	const filteredOptions = OPTIONS.filter(
		(option) => option.modes.includes(mode) && (option.visible ? option.visible() : true),
	);

	if (mode === 'reader') {
		return (
			<>
				{filteredOptions.map((option) => (
					<ReaderSettingsPopover
						key={option.label}
						label={option.label}
						icon={<option.icon />}
						onClick={(e) => void handleOptionClick(option, e)}
					/>
				))}
			</>
		);
	}

	if (mode === 'reader-menu') {
		return (
			<MenuDrawer
				items={filteredOptions.map((option) => ({
					icon: <option.icon />,
					label: option.label,
					action: () => handleOptionClick(option),
				}))}
				label="More options"
				height={220}
			>
				<ActionIcon variant="subtle" color="text" size="lg">
					<IconDots />
				</ActionIcon>
			</MenuDrawer>
		);
	}

	return (
		<>
			{filteredOptions.map((option) => (
				<Tooltip key={option.label} label={option.label} openDelay={600} withArrow>
					<ActionIcon
						variant="subtle"
						color="text"
						size={isSmall ? 'md' : 38}
						radius="xl"
						disabled={loading}
						onClick={(e) => void handleOptionClick(option, e)}
					>
						<option.icon size={isSmall ? 18 : undefined} />
					</ActionIcon>
				</Tooltip>
			))}
		</>
	);
};
