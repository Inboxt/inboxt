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

import classes from './Navbar.module.css';

import { NavbarLink } from '../NavbarLink';
import { clsx } from 'clsx';
import { FooterLinks } from '../FooterLinks';
import { AppViews } from '../../constants';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

const NAV_LINKS = [
	{
		id: 'inbox',
		label: 'Inbox',
		icon: <IconHome size={21} />,
	},
	{
		id: 'newsletters',
		label: 'Newsletters',
		icon: <IconMail size={21} />,
	},
	{
		id: 'highlights',
		label: 'Highlights',
		icon: <IconHighlight size={21} />,
	},
	{
		id: 'archive',
		label: 'Archive',
		icon: <IconArchive size={21} />,
	},
	{
		id: 'trash',
		label: 'Trash',
		icon: <IconTrash size={21} />,
	},
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
	const isAboveLgScreen = useScreenQuery('lg', 'above');

	// todo: scrollable correctly
	const navLinks = (
		<Stack mt={isAboveLgScreen ? 18 : 0} gap={0}>
			{NAV_LINKS.map((link) => (
				<NavbarLink
					key={link.id}
					label={link.label}
					icon={link.icon}
					opened={opened}
					toggleDrawer={toggle}
					view={link.id}
				/>
			))}

			<Divider
				m="sm"
				label={opened ? 'Labels' : undefined}
				my={opened ? 0 : 'xxs'}
			/>

			{BACKEND_LABELS.map((label) => (
				<NavbarLink
					key={label.id}
					label={label.name}
					icon={<IconLabelImportantFilled size={21} />}
					opened={opened}
					view={AppViews.LABEL}
					color={label.color}
					toggleDrawer={toggle}
				/>
			))}
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
			size="xs"
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
			{navLinks}

			<Box
				py="sm"
				pos="sticky"
				bottom={0}
				style={{ backgroundColor: 'var(--mantine-color-body)' }}
			>
				<FooterLinks justify="center" />
			</Box>
		</Drawer>
	);
};
