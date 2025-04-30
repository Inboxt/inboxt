import { Avatar } from '@mantine/core';
import {
	IconCloudUpload,
	IconDownload,
	IconExternalLink,
	IconLogout,
	IconSettings,
	IconTags,
	IconWallet,
} from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { modals } from '@modals/modals.ts';
import { MenuDrawer } from '../MenuDrawer';
import { ACTIVE_USER, SIGN_OUT } from '../../lib/graphql.ts';
import { client } from '../../lib/apolloClient.ts';

export const UserMenu = () => {
	const navigate = useNavigate();
	const [signOut] = useMutation(SIGN_OUT, {
		refetchQueries: [ACTIVE_USER],
	});

	const handleSignOut = async () => {
		await signOut();
		await client.cache.reset();

		return navigate({ to: '/' });
	};

	const USER_MENU_ITEMS = useMemo(
		() => [
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
			{
				label: 'Log Out',
				icon: <IconLogout />,
				action: handleSignOut,
			},
		],
		[],
	);

	return (
		<MenuDrawer items={USER_MENU_ITEMS} label="Quick Actions" height={390}>
			<Avatar
				name="Datguyducky"
				color="initials"
				allowedInitialsColors={['primary']}
				radius={4}
				className="mantine-active"
				style={{ cursor: 'pointer' }}
			/>
		</MenuDrawer>
	);
};
