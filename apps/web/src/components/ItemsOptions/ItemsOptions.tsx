import { ActionIcon, Button, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconTag,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';
import { modals } from '@modals/modals.ts';
import { useSearch } from '@tanstack/react-router';
import { Route } from '../../routes/_auth.index';
import { AppViews } from '../../constants';

const OPTIONS = [
	{
		label: 'Edit labels',
		icon: IconTag,
		onClick: modals.openLabelsSelectionModal,
	},
	{
		label: 'Move to archive',
		icon: IconArchive,
		onClick: () => console.log('Archive clicked'),
	},
	{
		label: 'Move to trash',
		icon: IconTrash,
		onClick: () => console.log('Trash clicked'),
	},
	{
		label: 'Open original',
		icon: IconWorld,
		onClick: () => console.log('Open original clicked'),
	},
];

const TRASH_OPTIONS = [
	{
		label: 'Delete permanently',
		icon: IconTrash,
		onClick: () => console.log('Delete permanently'),
	},
];

type ItemsOptionsProps = {
	size?: 'sm' | 'md';
};

export const ItemsOptions = ({ size = 'md' }: ItemsOptionsProps) => {
	const isSmallSize = size === 'sm';
	const { view } = useSearch({ from: Route.id });
	const optionsToRender = view === AppViews.TRASH ? TRASH_OPTIONS : OPTIONS;

	return (
		<>
			{optionsToRender.map((option) => {
				const IconComponent = option.icon;

				if (!isSmallSize && view === AppViews.TRASH) {
					return (
						<Button
							onClick={option.onClick}
							p={0}
							variant="transparent"
							color="text"
							size="compact-md"
						>
							{option.label}
						</Button>
					);
				}

				return (
					<Tooltip
						key={option.label}
						label={option.label}
						openDelay={600}
						withArrow
					>
						<ActionIcon
							variant="subtle"
							color="text"
							size={isSmallSize ? 'md' : 38}
							radius="xl"
							onClick={option.onClick}
						>
							<IconComponent
								size={isSmallSize ? 16 : undefined}
							/>
						</ActionIcon>
					</Tooltip>
				);
			})}
		</>
	);
};
