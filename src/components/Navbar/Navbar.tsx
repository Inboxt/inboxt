import { Box, Burger, Divider, Group, Stack, Drawer } from '@mantine/core';
import {
	IconArchive,
	IconHighlight,
	IconHome,
	IconLabelImportantFilled,
	IconMail,
	IconTrash,
	IconX,
} from '@tabler/icons-react';

import classes from './Navbar.module.css';

import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';
import { NavbarLink } from '../NavbarLink';
import { clsx } from 'clsx';

const NAV_LINKS = [
	{ id: 'inbox', label: 'Inbox', icon: <IconHome size={21} /> },
	{ id: 'newsletters', label: 'Newsletters', icon: <IconMail size={21} /> },
	{
		id: 'highlights',
		label: 'Highlights',
		icon: <IconHighlight size={21} />,
	},
	{ id: 'archive', label: 'Archive', icon: <IconArchive size={21} /> },
	{ id: 'trash', label: 'Trash', icon: <IconTrash size={21} /> },
];

const BACKEND_LABELS = [
	{
		id: 1,
		name: 'Reddit',
		color: 'gray-6',
	},
	{
		id: 2,
		name: 'Work Stuff',
		color: 'red-6',
	},
	{
		id: 3,
		name: 'Electronics',
		color: 'blue-6',
	},
	{
		id: 4,
		name: 'Listen',
		color: 'pink-6',
	},
];

type NavbarProps = {
	opened: boolean;
	toggle: () => void;
};

export const Navbar = ({ opened, toggle }: NavbarProps) => {
	const isLargeScreen = useLargeScreen();

	const navLinks = (
		<Stack
			mt={isLargeScreen ? 'md' : 0}
			gap={0}
			c="dark.7"
			pr={opened ? 'md' : '0'}
		>
			{NAV_LINKS.map((link) => (
				<NavbarLink
					key={link.id}
					label={link.label}
					icon={link.icon}
					opened={opened}
					href="#required-for-focus" // todo: handle navigation
				/>
			))}

			<Divider m="sm" label={opened ? 'Labels' : undefined} />

			{BACKEND_LABELS.map((label) => (
				<NavbarLink
					key={label.id}
					label={label.name}
					icon={<IconLabelImportantFilled size={21} />}
					opened={opened}
					href="#required-for-focus" // todo: handle navigation
					color={label.color}
				/>
			))}
		</Stack>
	);

	if (!isLargeScreen) {
		return (
			<Drawer
				opened={opened}
				onClose={toggle}
				title="Feeds"
				styles={{
					title: {
						fontSize: 'var(--mantine-font-size-xxl)',
						fontWeight: 700,
					},
				}}
				size="xs"
				closeButtonProps={{
					icon: <IconX size={34} color="black" />,
				}}
				overlayProps={{ opacity: 0.6 }}
			>
				{navLinks}
			</Drawer>
		);
	}

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
					pr={opened ? 'md' : 21}
					visibleFrom="lg"
				>
					<Burger opened={opened} onClick={toggle} />
				</Group>

				{navLinks}
			</Box>
		</>
	);
};
