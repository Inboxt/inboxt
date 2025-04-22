import { Box, NavLink, NavLinkProps, Tooltip, Transition } from '@mantine/core';
import { ReactNode } from 'react';
import classes from './NavbarLink.module.css';
import { Link } from '@tanstack/react-router';
import { Route } from '../../routes';
import { AppViews } from '../../constants';
import { kebabCase } from '../../utils/kebabCase.ts';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type NavbarLinkProps = {
	label: string;
	icon: ReactNode;
	opened: boolean;
	view: AppViews;
	toggleDrawer: () => void;
	color?: string;
};

export const NavbarLink = ({
	label,
	icon,
	opened,
	view,
	toggleDrawer,
	color,
}: NavbarLinkProps) => {
	const isBelowMdScreen = useScreenQuery('md', 'below');
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
					<Box
						c={
							color
								? `var(--mantine-color-${color}-6)`
								: undefined
						}
						display="flex"
					>
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
				}}
				renderRoot={(
					props: Omit<NavLinkProps, 'style' | 'onChange'>,
				) => {
					return (
						<Link
							from={Route.fullPath}
							search={{
								view:
									view === AppViews.LABEL
										? `${view}:${kebabCase(label)}`
										: view,
							}}
							{...props}
						/>
					);
				}}
			/>
		</Tooltip>
	);
};
