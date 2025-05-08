import { useDisclosure } from '@mantine/hooks';
import { Box, Drawer, Menu, Text, Title } from '@mantine/core';
import { cloneElement, ReactElement, ReactNode } from 'react';
import { IconX } from '@tabler/icons-react';

import classes from './MenuDrawer.module.css';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type MenuItem = {
	icon: ReactElement<{ size: number }>;
	label: string;
	action: () => void;
};

type MenuDrawerProps = {
	items: MenuItem[];
	children: ReactNode;
	label: string;
	height?: number;
};

// todo: handle links?
export const MenuDrawer = ({ items, children, label, height = 300 }: MenuDrawerProps) => {
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
				onClick={item.action}
				fz="md"
			>
				{item.label}
			</Menu.Item>
		));

	const renderDrawerItems = () =>
		items.map((item, index) => (
			<Box
				key={index}
				onClick={() => {
					closeDrawer();
					if (item?.action) {
						setTimeout(() => {
							item.action();
						}, 300);
					}
				}}
				className={classes.drawerItem}
			>
				{adjustIconSize(item.icon)}

				<Text ml="xs" fz="lg">
					{item.label}
				</Text>
			</Box>
		));

	if (isAboveXsScreen) {
		return (
			<Menu shadow="md" offset={4} withArrow>
				<Menu.Target>{children}</Menu.Target>

				<Menu.Dropdown>{renderMenuItems()}</Menu.Dropdown>
			</Menu>
		);
	}

	return (
		<>
			<Box onClick={openDrawer}>{children}</Box>

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
