import { Box, NavLink, NavLinkProps, Tooltip, Transition } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { Route } from '~routes/_auth.index';

import classes from './NavbarLink.module.css';

type NavbarLinkProps = {
	label: string;
	icon: ReactNode;
	opened: boolean;
	query: string;
	toggleDrawer: () => void;
	color?: string;
};

export const NavbarLink = ({
	label,
	icon,
	opened,
	query,
	toggleDrawer,
	color,
}: NavbarLinkProps) => {
	const isBelowMdScreen = useScreenQuery('md', 'below');
	const { setSelectedItems } = useContentSelection();

	return (
		<Tooltip label={label} position="right" disabled={opened}>
			<NavLink
				label={
					<Transition
						mounted={opened}
						transition="fade"
						duration={300}
						timingFunction="ease"
					>
						{(styles) => <div style={styles}>{label}</div>}
					</Transition>
				}
				leftSection={
					<Box c={color} display="flex">
						{icon}
					</Box>
				}
				variant="light"
				classNames={{
					root: classes.navLinkRoot,
					label: classes.navLinkLabel,
				}}
				onClick={() => {
					if (isBelowMdScreen) {
						toggleDrawer();
					}
					setSelectedItems([]);
				}}
				renderRoot={(props: Omit<NavLinkProps, 'style' | 'onChange'>) => {
					return <Link from={Route.fullPath} search={{ q: query }} {...props} />;
				}}
			/>
		</Tooltip>
	);
};
