import {
	ActionIcon,
	Box,
	Burger,
	Flex,
	Group,
	Stack,
	Text,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import classes from './Header.module.css';

import { AppName } from '../AppName';
import { UserMenu } from '../UserMenu';
import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';
import { AppSearch } from '../AppSearch';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type HeaderProps = {
	opened: boolean;
	toggle: () => void;
};

export const Header = ({ opened, toggle }: HeaderProps) => {
	const isBelowLgScreen = useScreenQuery('lg', 'below');
	const {
		toggleSelectAll,
		isAllSelected,
		isPartiallySelected,
		selectedItemIds,
		isSelected,
		deselectAll,
	} = useReaderContext();

	if (isSelected && isBelowLgScreen) {
		return (
			<Box px="md" pb="md" pt="md" className={classes.mobileSelection}>
				<Stack w="100%" justify="space-between">
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

						<Group gap="md" ml="auto" mih={38}>
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
			{isBelowLgScreen && (
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

						<Group gap="md" ml="auto" mih={38}>
							<ItemsOptions />
						</Group>
					</>
				) : (
					<AppSearch />
				)}

				{!isSelected && !isBelowLgScreen && <UserMenu />}
			</Flex>
		</Stack>
	);
};
