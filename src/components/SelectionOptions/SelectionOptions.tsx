import { ActionIcon, Group, Tooltip } from '@mantine/core';
import {
	IconArchive,
	IconTag,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';

export const SelectionOptions = () => {
	return (
		<Group gap="md" ml="auto">
			<Tooltip
				label="Edit labels"
				openDelay={600}
				withArrow
				//onClick={labelsModal.open}
			>
				<ActionIcon
					variant="subtle"
					color="gray"
					c="text"
					size={38}
					radius="xl"
				>
					<IconTag />
				</ActionIcon>
			</Tooltip>
			<Tooltip label="Move to archive" openDelay={600} withArrow>
				<ActionIcon
					variant="subtle"
					color="gray"
					c="text"
					size={38}
					radius="xl"
				>
					<IconArchive />
				</ActionIcon>
			</Tooltip>
			<Tooltip label="Move to trash" openDelay={600} withArrow>
				<ActionIcon
					variant="subtle"
					color="gray"
					c="text"
					size={38}
					radius="xl"
				>
					<IconTrash />
				</ActionIcon>
			</Tooltip>
			<Tooltip label="Open original" openDelay={600} withArrow>
				<ActionIcon
					variant="subtle"
					color="gray"
					c="text"
					size={38}
					radius="xl"
				>
					<IconWorld />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
};
