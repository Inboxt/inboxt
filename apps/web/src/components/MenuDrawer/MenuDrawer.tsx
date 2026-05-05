import { Box, Drawer, Menu, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { cloneElement, ReactElement, ReactNode } from 'react';

import { useScreenQuery } from '~hooks/useScreenQuery';

import classes from './MenuDrawer.module.css';

type MenuItem = {
	icon: ReactElement<{ size: number }>;
	label: string;
	action: () => void;
	disabled?: boolean;
};

type MenuDrawerProps = {
	items: MenuItem[];
	children: ReactNode;
	label: string;
	height?: number;
	disabled?: boolean;
};

export const MenuDrawer = ({ items, children, label, height = 300, disabled }: MenuDrawerProps) => {
	const isAboveXsScreen = useScreenQuery('xs', 'above');
	const iconSize = isAboveXsScreen ? 16 : 21;

	const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

	const adjustIconSize = (icon: ReactElement<{ size?: number }>) => {
		return cloneElement(icon, { size: iconSize });
	};

	const renderMenuItems = () =>
		items.map((item, index) => (
			<Menu.Item
				key={index}
				leftSection={adjustIconSize(item.icon)}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					item.action();
				}}
				fz="md"
				disabled={item.disabled}
			>
				{item.label}
			</Menu.Item>
		));

	const renderDrawerItems = () =>
		items.map((item, index) => (
			<Box
				key={index}
				onClick={(e) => {
					if (item.disabled) {
						return;
					}

					e.preventDefault();
					e.stopPropagation();
					closeDrawer();
					setTimeout(() => {
						item.action();
					}, 300);
				}}
				className={classes.drawerItem}
				style={{
					opacity: item.disabled ? 0.5 : 1,
					cursor: item.disabled ? 'not-allowed' : 'pointer',
				}}
			>
				{adjustIconSize(item.icon)}

				<Text ml="xs" fz="lg">
					{item.label}
				</Text>
			</Box>
		));

	if (isAboveXsScreen) {
		return (
			<Menu shadow="md" offset={4} withArrow width={180} disabled={disabled}>
				<Menu.Target>{children}</Menu.Target>

				<Menu.Dropdown>{renderMenuItems()}</Menu.Dropdown>
			</Menu>
		);
	}

	return (
		<>
			<Box
				onClick={(e) => {
					if (disabled) {
						return;
					}

					e.preventDefault();
					e.stopPropagation();
					openDrawer();
				}}
				style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
			>
				{children}
			</Box>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				position="bottom"
				classNames={{
					header: classes.drawerHeader,
				}}
				size={height}
				overlayProps={{
					opacity: 0.6,
				}}
				closeButtonProps={{
					icon: <IconX size={24} color="var(--mantine-color-text)" />,
				}}
				title={<Title order={4}>{label}</Title>}
			>
				{renderDrawerItems()}
			</Drawer>
		</>
	);
};
