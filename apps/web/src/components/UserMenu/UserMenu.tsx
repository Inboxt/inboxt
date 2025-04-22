import { Avatar, UnstyledButton } from '@mantine/core';
import {
	IconCloudUpload,
	IconDownload,
	IconExternalLink,
	IconSettings,
	IconTags,
	IconWallet,
} from '@tabler/icons-react';

import { modals } from '@modals/modals.ts';
import { MenuDrawer } from '../MenuDrawer';

const USER_MENU_ITEMS = [
	{
		label: 'Profile',
		icon: <IconSettings />,
		action: modals.openProfileModal,
	},
	{
		label: 'Manage Plan',
		icon: <IconWallet />,
		action: modals.openPlanModal,
	},
	{
		label: 'Roadmap',
		icon: <IconExternalLink />,
		action: () => console.log('Roadmap'),
	},
	{
		label: 'All Labels',
		icon: <IconTags />,
		action: modals.openLabelsModal,
	},
	{
		label: 'Import Data',
		icon: <IconCloudUpload />,
		action: () => console.log('Roadmap'),
	},
	{
		label: 'Install',
		icon: <IconDownload />,
		action: modals.openInstallModal,
	},
];

export const UserMenu = () => {
	return (
		<MenuDrawer items={USER_MENU_ITEMS} label="Quick Actions" height={360}>
			<Avatar
				name="Datguyducky"
				color="initials"
				allowedInitialsColors={['blue']}
				radius={4}
				className="mantine-active"
				style={{ cursor: 'pointer' }}
			/>
		</MenuDrawer>
	);
};
