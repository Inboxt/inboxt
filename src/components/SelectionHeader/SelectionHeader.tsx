import {
	ActionIcon,
	Box,
	Checkbox,
	Group,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconArchive,
	IconArrowLeft,
	IconTag,
	IconTrash,
	IconWorld,
} from '@tabler/icons-react';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { SelectionOptions } from '../SelectionOptions';

export const SelectionHeader = () => {
	const {
		toggleSelectAll,
		isAllSelected,
		isPartiallySelected,
		selectedItemIds,
	} = useReaderContext();

	return (
		<Box
			px="md"
			pb="md"
			pt="md"
			style={{
				borderStyle: 'solid',
				borderColor: 'var(--mantine-color-gray-2)',
				borderWidth: 0,
				borderBottomWidth: 1,
				backgroundColor: 'var(--mantine-color-gray-2)',
				height: 117,
				display: 'flex',
			}}
			hiddenFrom="lg"
		>
			<Stack w="100%">
				<Group align="center">
					<ActionIcon
						size="lg"
						variant="subtle"
						radius="xl"
						color="dark"
						ml="-6"
						onClick={toggleSelectAll}
					>
						<IconArrowLeft />
					</ActionIcon>

					<Text fw={600} size="xl">
						{selectedItemIds.length}
					</Text>

					<SelectionOptions />
				</Group>

				<Checkbox
					label="Select all" // todo: different label when checked
					variant="outline"
					color="dark"
					styles={{
						input: {
							backgroundColor: 'var(--mantine-color-gray-2)',
							borderColor: 'var(--mantine-color-dark-9)',
						},
					}} // TODO: Border color should be applied only when not selected
					onChange={toggleSelectAll}
					checked={isAllSelected}
					indeterminate={isPartiallySelected}
				/>
			</Stack>
		</Box>
	);
};
