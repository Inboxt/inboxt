import { ActionIcon, Box, Burger, Button, Flex, Group, Stack, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import { modals } from '@modals/modals.ts';

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
	const { toggleSelectAll, isAllSelected, isPartiallySelected, selectedItems, deselectAll } =
		useReaderContext();

	if (selectedItems.length > 0 && isBelowLgScreen) {
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
							{selectedItems.length}
						</Text>

						<Group gap="md" ml="auto" mih={38}>
							<ItemsOptions
								mode={selectedItems.length > 1 ? 'bulk' : 'single'}
								items={selectedItems}
							/>
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

				{selectedItems.length > 0 ? (
					<>
						<Text fw={600} size="xl">
							{selectedItems.length}
						</Text>

						<Group gap="md" ml="auto" mih={38}>
							<ItemsOptions
								mode={selectedItems.length > 1 ? 'bulk' : 'single'}
								items={selectedItems}
							/>
						</Group>
					</>
				) : (
					<AppSearch />
				)}

				{!selectedItems.length && (
					<Button variant="light" onClick={modals.openAddContentModal}>
						Add Link
					</Button>
				)}

				{!selectedItems.length && !isBelowLgScreen && <UserMenu />}
			</Flex>
		</Stack>
	);
};
