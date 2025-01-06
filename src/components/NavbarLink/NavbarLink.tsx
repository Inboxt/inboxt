import { Tooltip, NavLink, Transition, Box } from '@mantine/core';
import { ReactNode } from 'react';
import classes from './NavbarLink.module.css';

type NavbarLinkProps = {
	label: string;
	icon: ReactNode;
	opened: boolean;
	href: string;
	color?: string;
};

export const NavbarLink = ({
	label,
	icon,
	opened,
	href,
	color,
}: NavbarLinkProps) => (
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
					c={color ? `var(--mantine-color-${color})` : undefined}
					display="flex"
				>
					{icon}
				</Box>
			}
			variant="light"
			href={href}
			classNames={{
				root: classes.navLinkRoot,
				label: classes.navLinkLabel,
			}}
		/>
	</Tooltip>
);
