import { Box, NavLink, NavLinkProps, Tooltip, Transition } from '@mantine/core';
import { Link, useSearch } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { AppViews } from '@inbox-reader/common';

import { useContentSelection } from '~context/content-selection';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { Route } from '~routes/_auth.index';
import { kebabCase } from '~utils/kebabCase';

import classes from './NavbarLink.module.css';

type NavbarLinkProps = {
	label: string;
	icon: ReactNode;
	opened: boolean;
	view: AppViews;
	toggleDrawer: () => void;
	color?: string;
};

export const NavbarLink = ({ label, icon, opened, view, toggleDrawer, color }: NavbarLinkProps) => {
	const isBelowMdScreen = useScreenQuery('md', 'below');
	const { setSelectedItems } = useContentSelection();
	const { ...currentSearch } = useSearch({ from: Route.id });

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
					return (
						<Link
							from={Route.fullPath}
							search={{
								...currentSearch,
								view:
									view === AppViews.LABEL ? `${view}:${kebabCase(label)}` : view,
							}}
							{...props}
						/>
					);
				}}
			/>
		</Tooltip>
	);
};
