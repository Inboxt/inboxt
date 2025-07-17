import React from 'react';
import { ActionIcon, Tooltip, Text } from '@mantine/core';
import {
	IconTag,
	IconArchive,
	IconTrash,
	IconArrowBackUp,
	IconWorld,
	IconTrashX,
	IconDots,
} from '@tabler/icons-react';
import { modals } from '@modals/modals.ts';
import { useMutation } from '@apollo/client';
import { SAVED_ITEMS, UPDATE_SAVED_ITEM_STATUS } from '../../lib/graphql';
import { useReaderContext } from '../../context/ReaderContext';
import { ReaderSettingsPopover } from '../ReaderSettingsPopover';
import { MenuDrawer } from '../MenuDrawer';

export type ReaderItem = {
	id: string;
	status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
	originalUrl?: string;
};

export type ItemsOptionsMode = 'single' | 'bulk' | 'reader' | 'reader-menu';

type ItemsOptionsProps = {
	items: ReaderItem[];
	mode: ItemsOptionsMode;
	size?: 'sm' | 'md';
	onActionComplete?: () => void | Promise<void>;
};

type OptionContext = {
	items: ReaderItem[];
	loading: boolean;
};

type Option = {
	label: string;
	icon: React.ComponentType<any>;
	modes: ItemsOptionsMode[];
	visible?: (ctx: OptionContext) => boolean;
	enabled?: (ctx: OptionContext) => boolean;
	onClick: (ctx: OptionContext) => boolean | void | Promise<boolean | void>;
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

	const OPTIONS: Option[] = [
		{
			label: 'Edit labels',
			icon: IconTag,
			modes: ['single', 'reader', 'reader-menu'],
			visible: ({ items }) => items.length === 1 && items[0].status !== 'DELETED',
			onClick: ({ items }) => {
				modals.openLabelsSelectionModal({
					itemId: items[0].id,
					onClose: () => {
						setSelectedItems([]);
					},
				});
			},
		},
		{
			label: 'Restore',
			icon: IconArrowBackUp,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) => items.length > 0 && items.some((i) => i.status !== 'ACTIVE'),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: { data: { ids: items.map((i) => i.id), status: 'ACTIVE' } },
					refetchQueries: [SAVED_ITEMS],
				});
			},
		},
		{
			label: 'Move to archive',
			icon: IconArchive,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) => items.length > 0 && items.some((i) => i.status !== 'ARCHIVED'),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: {
						data: { ids: items.map((i) => i.id), status: 'ARCHIVED' },
					},
					refetchQueries: [SAVED_ITEMS],
				});
			},
		},
		{
			label: 'Move to trash',
			icon: IconTrash,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) => items.length > 0 && items.some((i) => i.status !== 'DELETED'),
			onClick: async ({ items }) => {
				await updateStatus({
					variables: { data: { ids: items.map((i) => i.id), status: 'DELETED' } },
					refetchQueries: [SAVED_ITEMS],
				});
			},
		},
		{
			label: 'Delete permanently',
			icon: IconTrashX,
			modes: ['single', 'bulk', 'reader', 'reader-menu'],
			visible: ({ items }) => items.length > 0 && items.every((i) => i.status === 'DELETED'),
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

				if (!confirmed) return false;

				// todo delete permanently: const ids = items.map((i) => i.id);
				return true;
			},
		},
		{
			label: 'Open original',
			icon: IconWorld,
			modes: ['single'],
			onClick: ({ items }) => {
				items?.length === 1 && items[0]?.originalUrl
					? window.open(items[0]?.originalUrl, '_blank', 'noopener,noreferrer')
					: null;
			},
		},
	];

	const handleOptionClick = async (e?: React.MouseEvent, option: Option) => {
		e?.stopPropagation?.();
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
						onClick={(e) => handleOptionClick(e, option)}
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
					action: () => handleOptionClick(undefined, option),
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
						onClick={(e) => handleOptionClick(e, option)}
					>
						<option.icon size={isSmall ? 18 : undefined} />
					</ActionIcon>
				</Tooltip>
			))}
		</>
	);
};
