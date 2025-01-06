import { ActionIcon, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconTag,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';
import { modals } from '@modals/modals.ts';

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

type ItemsOptionsProps = {
	size?: 'sm' | 'md';
};

export const ItemsOptions = ({ size = 'md' }: ItemsOptionsProps) => {
	const isSmallSize = size === 'sm';

	return (
		<>
			{OPTIONS.map((option) => {
				const IconComponent = option.icon;
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
