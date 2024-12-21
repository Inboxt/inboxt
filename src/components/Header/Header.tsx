import { Box, Checkbox, Flex, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import classes from './Header.module.css';

import { UserMenu } from '../UserMenu';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { SelectionOptions } from '../SelectionOptions';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';

export const Header = () => {
	const isLargeScreen = useLargeScreen();
	const {
		toggleSelectAll,
		isAllSelected,
		isPartiallySelected,
		selectedItemIds,
		isSelected,
	} = useReaderContext();

	return (
		<Box px="md" pb="md" className={classes.headerContainer}>
			<Flex gap="xs" align="center">
				<Checkbox
					variant="outline"
					color="dark"
					classNames={{
						input: classes.checkbox,
					}}
					onChange={toggleSelectAll}
					checked={isAllSelected}
					indeterminate={isPartiallySelected}
					visibleFrom="lg"
				/>

				{isSelected ? (
					<>
						<Text fw={600} size="xl">
							{selectedItemIds.length}
						</Text>
						<SelectionOptions />
					</>
				) : (
					<TextInput
						variant="filled"
						placeholder="Search for keywords or labels..."
						leftSection={<IconSearch size={18} />}
						w="100%"
					/>
				)}

				{!isSelected && isLargeScreen && <UserMenu />}
			</Flex>
		</Box>
	);
};
