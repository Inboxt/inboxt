import {
	ActionIcon,
	Box,
	Burger,
	Button,
	Flex,
	Group,
	Stack,
	Text,
	Tooltip,
	Select,
	rem,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconArrowLeft, IconList, IconPhoto } from '@tabler/icons-react';
import { useSearch, useRouter } from '@tanstack/react-router';

import { SORT_OPTIONS } from '@inbox-reader/common';

import { AppSearch } from '~components/AppSearch';
import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { modals } from '~modals/modals';
import { RouteSearchParams, Route } from '~routes/_auth.index';

import { AppName } from '../AppName';
import { ItemsOptions } from '../ItemsOptions';
import { ReaderCheckbox } from '../ReaderCheckbox';
import { UserMenu } from '../UserMenu';

import classes from './Header.module.css';

type HeaderProps = {
	opened: boolean;
	toggle: () => void;
};

export const Header = ({ opened, toggle }: HeaderProps) => {
	const isBelowLgScreen = useScreenQuery('lg', 'below');
	const { toggleSelectAll, isAllSelected, isPartiallySelected, selectedItems, deselectAll } =
		useContentSelection();

	const router = useRouter();
	const searchParams = useSearch({ from: Route.id });

	const [display, setDisplay] = useLocalStorage({
		key: 'display',
		defaultValue: 'list',
		serialize: (value) => value || '',
	});

	const [sort, setSort] = useLocalStorage<RouteSearchParams['sort']>({
		key: 'sort',
		defaultValue: 'date_desc',
		getInitialValueInEffect: false,
		serialize: (value) => value || '',
	});

	if (selectedItems.length > 0 && isBelowLgScreen) {
		return (
			<Stack gap="xs" px="md" pb="md" pt="md" className={classes.mobileSelectionWrapper}>
				<Group gap={0} justify="space-between">
					<Flex gap="xxxs">
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
					</Flex>

					<Box ml={-9}>
						<AppName />
					</Box>

					<UserMenu />
				</Group>

				<AppSearch variant="default" />

				<Box display="flex">
					<Group w="100%" justify="space-between" mih={40}>
						<ReaderCheckbox
							label="Select all"
							onChange={toggleSelectAll}
							checked={isAllSelected}
							indeterminate={isPartiallySelected}
							size="header"
						/>

						<Group gap={0} ml="auto">
							<ItemsOptions
								mode={
									selectedItems.length > 0 &&
									selectedItems.every((item) => item.__typename === 'Highlight')
										? 'highlights'
										: selectedItems.length > 1
											? 'bulk'
											: 'single'
								}
								items={selectedItems}
							/>
						</Group>
					</Group>
				</Box>
			</Stack>
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
				<AppSearch variant="filled" />
				{!isBelowLgScreen && <UserMenu />}
			</Flex>

			<Group gap="sm" align="center" mih={40} wrap="wrap">
				{selectedItems.length > 0 ? (
					<>
						<ReaderCheckbox
							onChange={toggleSelectAll}
							checked={isAllSelected}
							indeterminate={isPartiallySelected}
							visibleFrom="lg"
							size="header"
							label={`Selected (${selectedItems.length || 0})`}
						/>

						<Text fw={600} size="xl"></Text>

						<Group gap="md" ml="auto">
							<ItemsOptions
								mode={
									selectedItems.length > 0 &&
									selectedItems.every((item) => item.__typename === 'Highlight')
										? 'highlights'
										: selectedItems.length > 1
											? 'bulk'
											: 'single'
								}
								items={selectedItems}
							/>
						</Group>
					</>
				) : (
					<>
						<ReaderCheckbox
							onChange={toggleSelectAll}
							checked={isAllSelected}
							indeterminate={isPartiallySelected}
							size="header"
						/>

						<Tooltip label={display === 'list' ? 'Show images' : 'Show list'}>
							<ActionIcon
								variant="default"
								size="md"
								onClick={() => setDisplay(display === 'list' ? 'gallery' : 'list')}
							>
								{display === 'list' ? (
									<IconPhoto style={{ width: rem(20), height: rem(20) }} />
								) : (
									<IconList style={{ width: rem(20), height: rem(20) }} />
								)}
							</ActionIcon>
						</Tooltip>

						<Select
							size="xs"
							value={sort}
							aria-label="Sort items"
							onChange={(val) => {
								if (!val) {
									return;
								}

								setSort(val as typeof searchParams.sort);
								void router.navigate({
									to: Route.fullPath,
									search: {
										...searchParams,
										sort: val as typeof searchParams.sort,
									},
									replace: true,
								});
							}}
							data={SORT_OPTIONS}
						/>

						<Flex
							ml="auto"
							wrap="wrap"
							align="center"
							className={classes.newLinkButtonWrapper}
						>
							{!selectedItems.length && (
								<Button size="xs" onClick={modals.openAddContentModal} fullWidth>
									Add Link
								</Button>
							)}
						</Flex>
					</>
				)}
			</Group>
		</Stack>
	);
};
