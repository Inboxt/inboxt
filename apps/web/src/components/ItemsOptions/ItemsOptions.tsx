import { useMutation } from '@apollo/client/react';
import { ActionIcon, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconArrowBackUp,
	IconCopy,
	IconDots,
	IconEraser,
	IconFileText,
	IconCircleCheck,
	IconBook,
	IconProps,
	IconTag,
	IconTrash,
	IconTrashX,
	IconWorld,
	IconPencil,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';

import { ConfirmWithAlert } from '~components/ConfirmWithAlert';
import { toastSuccess } from '~components/Toast';
import { ToastProps } from '~components/Toast/type.ts';
import { SelectableItem, useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery.tsx';
import {
	PERMANENTLY_DELETE_SAVED_ITEMS,
	UPDATE_SAVED_ITEMS_STATUS,
	UPDATE_SAVED_ITEMS_READ_STATUS,
	DELETE_HIGHLIGHTS,
	ACTIVE_USER,
	GET_USER_STATS,
	ENTRIES,
} from '~lib/graphql';
import { updateEntriesCacheForReadStatus } from '~lib/graphql/cache';
import { SavedItem, SavedItemStatus, Highlight } from '~lib/graphql';
import { modals } from '~modals/modals';

import { MenuDrawer } from '../MenuDrawer';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';

export type ItemsOptionsMode =
	'single' | 'bulk' | 'reader' | 'reader-menu' | 'reader-toolbar' | 'highlights';

type ItemsOptionsProps = {
	items: SelectableItem[];
	mode: ItemsOptionsMode;
	size?: 'sm' | 'md';
	onActionComplete?: () => void | Promise<void>;
	onLoadingChange?: (loading: boolean) => void;
};

type SuccessToastOptions = Partial<Omit<ToastProps, 'id' | 'variant'>>;
type OptionResult = boolean | SuccessToastOptions | undefined;

type Option = {
	label: string;
	icon: React.ComponentType<IconProps>;
	modes: ItemsOptionsMode[];
	visible?: () => boolean;
	onClick: () => OptionResult | Promise<OptionResult>;
	clearsSelection?: boolean;
	runsOnActionComplete?: boolean;
};

type SavedSelectable = Extract<SelectableItem, { __typename: 'SavedItem' }>;
type HighlightSelectable = Extract<SelectableItem, { __typename: 'Highlight' }>;

export const ItemsOptions = ({
	items,
	mode,
	size = 'md',
	onActionComplete,
	onLoadingChange,
}: ItemsOptionsProps) => {
	const isSmall = size === 'sm';
	const isBelowMdScreen = useScreenQuery('md', 'below');

	const [updateStatus, { loading: updateLoading }] = useMutation(UPDATE_SAVED_ITEMS_STATUS, {
		update(cache, { data }) {
			const updated = (data?.updateSavedItemsStatus || []) as SavedItem[];
			const ids = updated.map((item) => item.id);

			cache.modify({
				fields: {
					entries(existing: any, { readField }: any) {
						if (!existing || !existing.edges) {
							return existing;
						}

						const newEdges = existing.edges.filter((edge: any) => {
							const node = readField('node', edge);
							if (!node) {
								return false;
							}
							const nodeId = readField('id', node);
							return !ids.includes(nodeId as string);
						});

						return newEdges.length === existing.edges.length
							? existing
							: { ...existing, edges: newEdges };
					},
				},
			});

			updated.forEach((item) => {
				cache.evict({ id: cache.identify(item) });
			});
			cache.gc();
		},
		refetchQueries: [GET_USER_STATS],
	});
	const [deleteHighlights, { loading: deleteLoading }] = useMutation(DELETE_HIGHLIGHTS, {
		update(cache, { data }, { variables }) {
			if (!data?.deleteHighlights?.success) {
				return;
			}

			const ids = (variables?.data.items || []).map((item) => item.id);

			cache.modify({
				fields: {
					entries(existing: any, { readField }: any) {
						if (!existing?.edges) {
							return existing;
						}

						const filteredEdges = existing.edges.filter((edge: any) => {
							const node = readField('node', edge);
							const id = readField('id', node as any);

							return !ids.includes(id as string);
						});

						return {
							...existing,
							edges: filteredEdges,
						};
					},
				},
			});

			ids.forEach((id) => {
				cache.evict({
					id: cache.identify({
						__typename: 'Highlight',
						id,
					}),
				});
			});

			cache.gc();
		},
		refetchQueries: [ACTIVE_USER, GET_USER_STATS],
	});
	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		update(cache, { data }, { variables }) {
			if (data?.permanentlyDeleteSavedItems?.success) {
				const ids = (variables?.data?.ids || []) as string[];

				cache.modify({
					fields: {
						entries(existing: any, { readField }: any) {
							if (!existing || !existing.edges) {
								return existing;
							}

							const newEdges = existing.edges.filter((edge: any) => {
								const node = readField('node', edge);
								if (!node) {
									return false;
								}
								const nodeId = readField('id', node);
								return !ids.includes(nodeId as string);
							});

							return newEdges.length === existing.edges.length
								? existing
								: { ...existing, edges: newEdges };
						},
					},
				});

				ids.forEach((id) => {
					cache.evict({ id: cache.identify({ __typename: 'SavedItem', id }) });
				});
				cache.gc();
			}
		},
		refetchQueries: [ACTIVE_USER, GET_USER_STATS],
	});
	const [updateReadStatus, { loading: readStatusLoading }] = useMutation(
		UPDATE_SAVED_ITEMS_READ_STATUS,
		{
			update(cache, { data }) {
				const updated = (data?.updateSavedItemsReadStatus || []) as SavedItem[];
				updateEntriesCacheForReadStatus(cache, updated);
			},
			refetchQueries: [GET_USER_STATS, ENTRIES],
		},
	);

	const { setSelectedItems } = useContentSelection();
	const navigate = useNavigate();
	const [activeOptionLabel, setActiveOptionLabel] = useState<string | null>(null);
	const loading =
		updateLoading || deleteLoading || readStatusLoading || activeOptionLabel !== null;

	React.useEffect(() => {
		onLoadingChange?.(loading);
	}, [loading, onLoadingChange]);

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

	const shouldDeferSuccessToasts = Boolean(
		onActionComplete && ['reader', 'reader-menu'].includes(mode),
	);

	const showSuccessToast = (opts: SuccessToastOptions) => {
		if (shouldDeferSuccessToasts) {
			return opts;
		}

		toastSuccess({ ...opts, position: isBelowMdScreen ? 'top-center' : undefined });
		return undefined;
	};

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
			label: 'Edit Item',
			icon: IconPencil,
			modes: ['single', 'reader', 'reader-toolbar'],
			clearsSelection: false,
			runsOnActionComplete: false,
			visible: () => savedItems.length === 1,
			onClick: () => {
				const [item] = savedItems;
				if (item) {
					modals.openEditInfoModal({ item });
				}
				return undefined;
			},
		},
		{
			label: 'Edit labels',
			icon: IconTag,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
			clearsSelection: false,
			runsOnActionComplete: false,
			visible: () =>
				savedItems.length >= 1 &&
				savedItems.every((i) => i.status !== SavedItemStatus.Deleted),
			onClick: () => {
				const ids = savedItems.map((i) => i.id);
				if (ids.length) {
					modals.openLabelsSelectionModal({
						itemIds: ids,
						onClose: () => {
							setSelectedItems([]);
						},
					});
				}
				return undefined;
			},
		},
		{
			label: 'Mark as read',
			icon: IconCircleCheck,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
			visible: () => savedItems.length > 0 && savedItems.some((i) => !i.readAt),
			onClick: async () => {
				const ids = savedItems.filter((i) => !i.readAt).map((i) => i.id);
				if (ids.length === 0) {
					return undefined;
				}

				await updateReadStatus({
					variables: { data: { ids, isRead: true } },
				});

				return showSuccessToast({
					title:
						ids.length > 1
							? `${ids.length} items marked as read.`
							: 'Item marked as read.',
				});
			},
		},
		{
			label: 'Mark as unread',
			icon: IconBook,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
			visible: () => savedItems.length > 0 && savedItems.some((i) => !!i.readAt),
			onClick: async () => {
				const ids = savedItems.filter((i) => !!i.readAt).map((i) => i.id);
				if (ids.length === 0) {
					return undefined;
				}

				await updateReadStatus({
					variables: { data: { ids, isRead: false } },
				});

				return showSuccessToast({
					title:
						ids.length > 1
							? `${ids.length} items marked as unread.`
							: 'Item marked as unread.',
				});
			},
		},
		{
			label: 'Restore',
			icon: IconArrowBackUp,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
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

				return showSuccessToast({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were restored.`
							: 'Item was restored.',
				});
			},
		},
		{
			label: 'Move to archive',
			icon: IconArchive,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
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

				return showSuccessToast({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were archived.`
							: 'Item was archived.',
					action: createUndoAction(savedItemIds, previousById),
				});
			},
		},
		{
			label: 'Move to trash',
			icon: IconTrash,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
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

				return showSuccessToast({
					title:
						savedItems.length > 1
							? `${savedItems.length} items were moved to trash.`
							: 'Item was moved to trash.',
					action: createUndoAction(savedItemIds, previousById),
				});
			},
		},
		{
			label: 'Delete permanently',
			icon: IconTrashX,
			modes: ['single', 'bulk', 'reader', 'reader-toolbar'],
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

				return (
					showSuccessToast({
						title:
							count > 1
								? `${count} items were deleted permanently`
								: 'Item was deleted permanently',
					}) ?? true
				);
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

				return (
					showSuccessToast({
						title:
							count > 1
								? `${count} highlights were deleted permanently`
								: 'Highlight was deleted permanently',
					}) ?? true
				);
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
					await navigate({
						to: '/r/$id',
						params: { id: highlight.savedItem.id },
						search: (prev) => prev,
					});
					return undefined;
				}

				return undefined;
			},
		},
	];

	const handleOptionClick = async (option: Option, e?: React.MouseEvent) => {
		e?.preventDefault();
		e?.stopPropagation();
		if (option.clearsSelection ?? true) {
			setSelectedItems([]);
		}

		setActiveOptionLabel(option.label);
		try {
			const result = await option.onClick();
			if (result !== false && (option.runsOnActionComplete ?? true) && onActionComplete) {
				await onActionComplete();
			}

			if (result && typeof result === 'object') {
				window.setTimeout(
					() =>
						toastSuccess({
							...result,
							position: isBelowMdScreen ? 'top-center' : undefined,
						}),
					350,
				);
			}
		} finally {
			setActiveOptionLabel(null);
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
						disabled={loading}
						onClick={(e) => handleOptionClick(option, e)}
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
					disabled: loading,
					action: () => handleOptionClick(option),
				}))}
				label="More options"
				height={220}
				disabled={loading}
			>
				<ActionIcon variant="subtle" color="text" size="lg" disabled={loading}>
					<IconDots />
				</ActionIcon>
			</MenuDrawer>
		);
	}

	if (mode === 'reader-toolbar') {
		return (
			<>
				{filteredOptions.map((option) => (
					<ReaderSettingsPopover
						key={option.label}
						label={option.label}
						icon={<option.icon />}
						disabled={loading}
						radius="xl"
						size={40}
						onClick={(e) => handleOptionClick(option, e)}
					/>
				))}
			</>
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
						onClick={(e) => handleOptionClick(option, e)}
					>
						<option.icon size={isSmall ? 18 : undefined} />
					</ActionIcon>
				</Tooltip>
			))}
		</>
	);
};
