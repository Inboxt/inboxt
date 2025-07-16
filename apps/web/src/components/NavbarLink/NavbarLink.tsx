import { Box, NavLink, NavLinkProps, Tooltip, Transition } from '@mantine/core';
import { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

import classes from './NavbarLink.module.css';

import { Route } from '../../routes/_auth.index';
import { AppViews } from '../../constants';
import { kebabCase } from '../../utils/kebabCase.ts';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { useReaderContext } from '../../context/ReaderContext.tsx';

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
	const { setSelectedItems } = useReaderContext();

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
