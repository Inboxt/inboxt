import {
	ActionIcon,
	Box,
	Burger,
	Checkbox,
	Flex,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { AppName } from '../AppName';
import { UserMenu } from '../UserMenu';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';
import classes from '../Header/Header.module.css';
import { SelectionOptions } from '../SelectionOptions';
import { IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { useReaderContext } from '../../context/ReaderContext.tsx';
//
// export const TestHeader = ({ opened, toggle }) => {
// 	const isLargeScreen = useLargeScreen();
// 	const {
// 		toggleSelectAll,
// 		isAllSelected,
// 		isPartiallySelected,
// 		selectedItemIds,
// 		isSelected,
// 	} = useReaderContext();
//
// 	return (
// 		<Stack px="md" pb="md" gap="xs" className={classes.headerContainer}>
// 			{!isLargeScreen && (
// 				<Group gap={0} justify="space-between">
// 					<Burger opened={opened} onClick={toggle} />
//
// 					<AppName />
//
// 					<UserMenu />
// 				</Group>
// 			)}
//
// 			<Flex gap="xs" align="center">
// 				<Checkbox
// 					variant="outline"
// 					color="dark"
// 					classNames={{
// 						input: classes.checkbox,
// 					}}
// 					onChange={toggleSelectAll}
// 					checked={isAllSelected}
// 					indeterminate={isPartiallySelected}
// 					visibleFrom="lg"
// 				/>
//
// 				{isSelected ? (
// 					<>
// 						<Text fw={600} size="xl">
// 							{selectedItemIds.length}
// 						</Text>
// 						<SelectionOptions />
// 					</>
// 				) : (
// 					<TextInput
// 						variant="filled"
// 						placeholder="Search for keywords or labels..."
// 						leftSection={<IconSearch size={18} />}
// 						w="100%"
// 					/>
// 				)}
//
// 				{!isSelected && isLargeScreen && <UserMenu />}
// 			</Flex>
// 		</Stack>
// 	);
// };

export const TestHeader = ({ opened, toggle }) => {
	const isLargeScreen = useLargeScreen();
	const {
		toggleSelectAll,
		isAllSelected,
		isPartiallySelected,
		selectedItemIds,
		isSelected,
	} = useReaderContext();

	if (isSelected && !isLargeScreen) {
		// Render the SelectionHeader layout
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
						label="Select all"
						variant="outline"
						color="dark"
						styles={{
							input: {
								backgroundColor: 'var(--mantine-color-gray-2)',
								borderColor: 'var(--mantine-color-dark-9)',
							},
						}}
						onChange={toggleSelectAll}
						checked={isAllSelected}
						indeterminate={isPartiallySelected}
					/>
				</Stack>
			</Box>
		);
	}

	// Default TestHeader layout
	return (
		<Stack px="md" pb="md" gap="xs" className={classes.headerContainer}>
			{!isLargeScreen && (
				<Group gap={0} justify="space-between">
					<Burger opened={opened} onClick={toggle} />

					<AppName />

					<UserMenu />
				</Group>
			)}

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
		</Stack>
	);
};
