import {
	ActionIcon,
	Box,
	Burger,
	Flex,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { AppName } from '../AppName';
import { UserMenu } from '../UserMenu';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';
import classes from './Header.module.css';
import { IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';

type HeaderProps = {
	opened: boolean;
	toggle: () => void;
};

export const Header = ({ opened, toggle }: HeaderProps) => {
	const isLargeScreen = useLargeScreen();
	const {
		toggleSelectAll,
		isAllSelected,
		isPartiallySelected,
		selectedItemIds,
		isSelected,
		deselectAll,
	} = useReaderContext();

	if (isSelected && !isLargeScreen) {
		return (
			<Box px="md" pb="md" pt="md" className={classes.mobileSelection}>
				<Stack w="100%">
					<Group align="center">
						<ActionIcon
							size="lg"
							variant="subtle"
							radius="xl"
							color="text"
							ml="-6"
							onClick={deselectAll}
						>
							<IconArrowLeft />
						</ActionIcon>

						<Text fw={600} size="xl">
							{selectedItemIds.length}
						</Text>

						<Group gap="md" ml="auto">
							<ItemsOptions />
						</Group>
					</Group>

					<ReaderCheckbox
						label="Select all"
						onChange={toggleSelectAll}
						checked={isAllSelected}
						indeterminate={isPartiallySelected}
					/>
				</Stack>
			</Box>
		);
	}

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
				<ReaderCheckbox
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

						<Group gap="md" ml="auto">
							<ItemsOptions />
						</Group>
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
