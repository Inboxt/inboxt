import { useQuery } from '@apollo/client';
import {
	Box,
	Burger,
	Collapse,
	Divider,
	Drawer,
	Group,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	IconArchive,
	IconChevronDown,
	IconChevronUp,
	IconHighlight,
	IconHome,
	IconLabelImportantFilled,
	IconMail,
	IconSearch,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { clsx } from 'clsx';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { LABELS, SAVED_QUERIES } from '~lib/graphql';
import { formatLabelForQuery } from '~utils/formatLabelForQuery.ts';

import { FooterLinks } from '../FooterLinks';
import { NavbarLink } from '../NavbarLink';

import classes from './Navbar.module.css';

const NAV_LINKS = [
	{
		id: 'inbox',
		label: 'Inbox',
		icon: <IconHome size={21} />,
		query: 'in:inbox type:article',
	},
	{
		id: 'newsletters',
		label: 'Newsletters',
		icon: <IconMail size={21} />,
		query: 'in:inbox type:newsletter',
	},
	{
		id: 'highlights',
		label: 'Highlights',
		icon: <IconHighlight size={21} />,
		query: 'type:highlight',
	},
	{
		id: 'archive',
		label: 'Archive',
		icon: <IconArchive size={21} />,
		query: 'in:archive',
	},
	{
		id: 'trash',
		label: 'Trash',
		icon: <IconTrash size={21} />,
		query: 'in:trash',
	},
];

type NavbarProps = {
	opened: boolean;
	toggle: () => void;
};

export const Navbar = ({ opened, toggle }: NavbarProps) => {
	const [savedQueriesOpened, { toggle: toggleSavedQueries }] = useDisclosure(true);
	const [labelsOpened, { toggle: toggleLabels }] = useDisclosure(true);

	const { data: labelsData } = useQuery(LABELS, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const { data: queriesData } = useQuery(SAVED_QUERIES, {
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});

	const isAboveLgScreen = useScreenQuery('lg', 'above');

	const navLinks = (
		<Stack mt={isAboveLgScreen ? 'md' : 0} gap={0} h="100%" pb={isAboveLgScreen ? 'xxl' : 0}>
			{NAV_LINKS.map((link) => (
				<NavbarLink
					key={link.id}
					label={link.label}
					icon={link.icon}
					opened={opened}
					toggleDrawer={toggle}
					query={link.query}
				/>
			))}

			<Box className={classes.navbarLabelsList}>
				{queriesData?.savedQueries?.length ? (
					<>
						<UnstyledButton
							onClick={toggleSavedQueries}
							w="100%"
							display={opened ? 'block' : 'none'}
						>
							<Divider
								m="sm"
								label={
									<Group gap={4}>
										<Text size="xs" fw={500} c="dimmed">
											Saved Queries
										</Text>
										{savedQueriesOpened ? (
											<IconChevronUp size={12} />
										) : (
											<IconChevronDown size={12} />
										)}
									</Group>
								}
								my={1}
							/>
						</UnstyledButton>

						{!opened && <Divider m="sm" my="xxs" />}

						<Collapse in={savedQueriesOpened || !opened}>
							{queriesData.savedQueries.map((query) => (
								<NavbarLink
									key={query.id}
									label={query.name}
									icon={<IconSearch size={21} />}
									opened={opened}
									query={query.query}
									toggleDrawer={toggle}
								/>
							))}
						</Collapse>
					</>
				) : null}

				{labelsData?.labels?.length ? (
					<>
						<UnstyledButton
							onClick={toggleLabels}
							w="100%"
							display={opened ? 'block' : 'none'}
						>
							<Divider
								m="sm"
								label={
									<Group gap={4}>
										<Text size="xs" fw={500} c="dimmed">
											Labels
										</Text>
										{labelsOpened ? (
											<IconChevronUp size={12} />
										) : (
											<IconChevronDown size={12} />
										)}
									</Group>
								}
								my={1}
							/>
						</UnstyledButton>

						{!opened && <Divider m="sm" my="xxs" />}

						<Collapse in={labelsOpened || !opened}>
							{labelsData.labels.map((label) => (
								<NavbarLink
									key={label.id}
									label={label.name}
									icon={<IconLabelImportantFilled size={21} />}
									opened={opened}
									query={`in:inbox ${formatLabelForQuery(label.name)}`}
									color={label.color}
									toggleDrawer={toggle}
								/>
							))}
						</Collapse>
					</>
				) : null}
			</Box>
		</Stack>
	);

	if (isAboveLgScreen) {
		return (
			<>
				<Box
					className={clsx(
						classes.navbar,
						opened ? classes.openedNavbar : classes.closedNavbar,
					)}
					pt="md"
				>
					<Group
						justify="flex-end"
						px="md"
						pr={opened ? 'md' : 'lg'}
						visibleFrom="lg"
						mt={2}
					>
						<Burger opened={opened} onClick={toggle} />
					</Group>

					{navLinks}
				</Box>
			</>
		);
	}

	return (
		<Drawer
			opened={opened}
			onClose={toggle}
			title="Feeds"
			closeButtonProps={{
				icon: <IconX size={34} color="var(--mantine-color-text)" />,
			}}
			overlayProps={{ opacity: 0.6 }}
			classNames={{
				title: classes.mobileDrawerTitle,
				content: classes.mobileDrawerContent,
				body: classes.mobileDrawerBody,
			}}
		>
			<Box className={classes.mobileNavMain}>{navLinks}</Box>

			<Box bg="body">
				<FooterLinks position="center" />
			</Box>
		</Drawer>
	);
};
