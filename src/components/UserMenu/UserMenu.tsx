import {
	Avatar,
	Box,
	Drawer,
	Menu,
	UnstyledButton,
	Text,
	Title,
} from '@mantine/core';
import {
	IconCloudUpload,
	IconDownload,
	IconExternalLink,
	IconSettings,
	IconTags,
	IconWallet,
	IconX,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useExtraSmallScreen } from '../../hooks/useExtraSmallScreen.tsx';

import classes from './UserMenu.module.css';
import { modals } from '@modals/modals.ts';

export const UserMenu = () => {
	const isLargeScreen = useExtraSmallScreen();
	const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
		useDisclosure(false);

	const menuItems = [
		{
			label: 'Profile',
			icon: <IconSettings size={isLargeScreen ? 16 : 21} />,
			action: modals.openProfileModal,
		},
		{
			label: 'Manage Plan',
			icon: <IconWallet size={isLargeScreen ? 16 : 21} />,
			action: modals.openPlanModal,
		},
		{
			label: 'Roadmap',
			icon: <IconExternalLink size={isLargeScreen ? 16 : 21} />,
			href: '',
			target: '_blank',
		},
		{
			label: 'All Labels',
			icon: <IconTags size={isLargeScreen ? 16 : 21} />,
			action: modals.openLabelsModal,
		},
		{
			label: 'Import Data',
			icon: <IconCloudUpload size={isLargeScreen ? 16 : 21} />,
		},
		{
			label: 'Install',
			icon: <IconDownload size={isLargeScreen ? 16 : 21} />,
			action: modals.openInstallModal,
		},
	];

	const renderMenuItems = () =>
		menuItems.map((item, index) => (
			<Menu.Item
				key={index}
				leftSection={item.icon}
				onClick={item.action}
				component={item.href ? 'a' : undefined}
				href={item.href}
				target={item.target}
				fz="md"
			>
				{item.label}
			</Menu.Item>
		));

	const renderDrawerItems = () =>
		menuItems.map((item, index) => (
			<Box
				key={index}
				onClick={() => {
					closeDrawer();
					if (item.action) {
						setTimeout(() => {
							item.action();
						}, 300);
					}
				}}
				component={item.href ? 'a' : 'div'}
				href={item.href}
				target={item.target}
				className={classes.drawerItem}
			>
				{item.icon}

				<Text ml="xs" fz="lg">
					{item.label}
				</Text>
			</Box>
		));

	return isLargeScreen ? (
		<Menu shadow="md" offset={4} withArrow>
			<Menu.Target>
				<UnstyledButton className="mantine-active">
					<Avatar
						name="Datguyducky"
						color="initials"
						allowedInitialsColors={['blue']}
						radius={4}
					/>
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>{renderMenuItems()}</Menu.Dropdown>
		</Menu>
	) : (
		<>
			<UnstyledButton onClick={openDrawer}>
				<Avatar
					name="Datguyducky"
					color="initials"
					allowedInitialsColors={['blue']}
					radius={4}
				/>
			</UnstyledButton>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				position="bottom"
				size={360}
				classNames={{
					header: classes.drawerHeader,
				}}
				overlayProps={{
					opacity: 0.6,
				}}
				closeButtonProps={{
					icon: <IconX size={24} color="black" />,
				}}
				title={<Title order={4}>Quick Actions</Title>}
			>
				{renderDrawerItems()}
			</Drawer>
		</>
	);
};
