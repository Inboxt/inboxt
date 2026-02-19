import { useQuery } from '@apollo/client';
import { Box, Burger, Divider, Drawer, Group, Stack } from '@mantine/core';
import {
	IconArchive,
	IconHighlight,
	IconHome,
	IconLabelImportantFilled,
	IconMail,
	IconTrash,
	IconX,
} from '@tabler/icons-react';
import { clsx } from 'clsx';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { LABELS } from '~lib/graphql';
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
	const { data } = useQuery(LABELS);
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

			{data?.labels?.length ? (
				<Divider m="sm" label={opened ? 'Labels' : undefined} my={opened ? 0 : 'xxs'} />
			) : null}

			<Box className={classes.navbarLabelsList}>
				{data?.labels?.map((label) => (
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
