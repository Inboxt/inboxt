import { useMutation } from '@apollo/client';
import { ActionIcon, Text, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconArrowBackUp,
	IconDots,
	IconProps,
	IconTag,
	IconTrash,
	IconTrashX,
	IconWorld,
} from '@tabler/icons-react';
import React from 'react';

import { useReaderContext } from '~context/reader';
import {
	PERMANENTLY_DELETE_SAVED_ITEMS,
	SAVED_ITEMS,
	UPDATE_SAVED_ITEM_STATUS,
} from '~lib/graphql';
import { SavedItem, SavedItemStatus } from '~lib/graphql/generated/graphql';
import { modals } from '~modals/modals';

import { MenuDrawer } from '../MenuDrawer';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';

export type ItemsOptionsMode = 'single' | 'bulk' | 'reader' | 'reader-menu';

type ItemsOptionsProps = {
	items: Pick<SavedItem, 'status' | 'id' | 'originalUrl'>[];
	mode: ItemsOptionsMode;
	size?: 'sm' | 'md';
	onActionComplete?: () => void | Promise<void>;
};

type OptionContext = {
	items: Pick<SavedItem, 'status' | 'id' | 'originalUrl'>[];
	loading: boolean;
};

type Option = {
	label: string;
	icon: React.ComponentType<IconProps>;
	modes: ItemsOptionsMode[];
	visible?: (ctx: OptionContext) => boolean;
	enabled?: (ctx: OptionContext) => boolean;
	onClick: (ctx: OptionContext) => boolean | Promise<boolean | undefined> | undefined;
};

export const ItemsOptions: React.FC<ItemsOptionsProps> = ({
	items,
	mode,
	size = 'md',
	onActionComplete,
}) => {
	const isSmall = size === 'sm';
	const [updateStatus, { loading }] = useMutation(UPDATE_SAVED_ITEM_STATUS);
	const { setSelectedItems } = useReaderContext();
	const ctx: OptionContext = { items, loading };

	const [permanentlyDeleteSavedItems] = useMutation(PERMANENTLY_DELETE_SAVED_ITEMS, {
		refetchQueries: [SAVED_ITEMS],
	});

	const OPTIONS: Option[] = [
		{
			label: 'Edit labels',
			icon: IconTag,
			modes: ['single', 'reader', 'reader-menu'],
			visible: ({ items }) =>
				items.length === 1 && items[0]!.status !== SavedItemStatus.Deleted,
			onClick: ({ items }) => {
				modals.openLabelsSelectionModal({
					itemId: items[0]!.id,
					onClose: () => {
						setSelectedItems([]);
					},
				});
				return undefined;
			},
		},
		{
			label: 'Restore',
			icon: IconArrowBackUp,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) =>
				items.length > 0 && items.some((i) => i.status !== SavedItemStatus.Active),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: {
						data: { ids: items.map((i) => i.id), status: SavedItemStatus.Active },
					},
					refetchQueries: [SAVED_ITEMS],
				});
				return undefined;
			},
		},
		{
			label: 'Move to archive',
			icon: IconArchive,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) =>
				items.length > 0 && items.some((i) => i.status !== SavedItemStatus.Archived),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: {
						data: { ids: items.map((i) => i.id), status: SavedItemStatus.Archived },
					},
					refetchQueries: [SAVED_ITEMS],
				});
				return undefined;
			},
		},
		{
			label: 'Move to trash',
			icon: IconTrash,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) =>
				items.length > 0 && items.some((i) => i.status !== SavedItemStatus.Deleted),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: {
						data: { ids: items.map((i) => i.id), status: SavedItemStatus.Deleted },
					},
					refetchQueries: [SAVED_ITEMS],
				});
				return undefined;
			},
		},
		{
			label: 'Delete permanently',
			icon: IconTrashX,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) =>
				items.length > 0 && items.every((i) => i.status === SavedItemStatus.Deleted),
			enabled: ({ items }) => items.length > 0,
			onClick: async ({ items }) => {
				const count = items.length;

				const confirmed = await new Promise<boolean>((resolve) => {
					modals.openConfirmModal({
						title: 'Delete Permanently',
						centered: true,
						children: (
							<Text>
								Are you sure you want to permanently delete{' '}
								{count > 1 ? `${count} items` : 'this item'}? <br />
								This action cannot be undone.
							</Text>
						),
						labels: { confirm: 'Delete permanently', cancel: 'Cancel' },
						confirmProps: { color: 'red' },
						onConfirm: () => resolve(true),
						onCancel: () => resolve(false),
					});
				});

				if (!confirmed) {
					return false;
				}

				await permanentlyDeleteSavedItems({
					variables: { data: { ids: items.map((i) => i.id) } },
				});

				return true;
			},
		},
		{
			label: 'Open original',
			icon: IconWorld,
			modes: ['single'],
			onClick: ({ items }) => {
				if (items.length === 1 && items[0]?.originalUrl) {
					window.open(items[0].originalUrl, '_blank', 'noopener,noreferrer');
				}

				return undefined;
			},
		},
	];

	const handleOptionClick = async (option: Option, e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (option.label !== 'Edit labels') {
			setSelectedItems([]);
		}

		const result = await option.onClick(ctx);
		if (result !== false && onActionComplete && option.label !== 'Edit labels') {
			await onActionComplete();
		}
	};

	if (mode === 'reader') {
		return (
			<>
				{OPTIONS.filter(
					(option) =>
						option.modes.includes(mode) &&
						(option.visible ? option.visible(ctx) : true),
				).map((option) => (
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
				items={OPTIONS.filter(
					(option) =>
						option.modes.includes(mode) &&
						(option.visible ? option.visible(ctx) : true),
				).map((option) => ({
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
			{OPTIONS.filter(
				(option) =>
					option.modes.includes(mode) && (option.visible ? option.visible(ctx) : true),
			).map((option) => (
				<Tooltip key={option.label} label={option.label} openDelay={600} withArrow>
					<ActionIcon
						variant="subtle"
						color="text"
						size={isSmall ? 'md' : 38}
						radius="xl"
						disabled={loading || (option.enabled && !option.enabled(ctx))}
						onClick={(e) => void handleOptionClick(option, e)}
					>
						<option.icon size={isSmall ? 18 : undefined} />
					</ActionIcon>
				</Tooltip>
			))}
		</>
	);
};
