import { useMutation, useQuery } from '@apollo/client';
import { Avatar } from '@mantine/core';
import {
	IconCloudUpload,
	IconDownload,
	IconKey,
	IconLogout,
	IconMail,
	IconSettings,
	IconTags,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import { ACTIVE_USER, SIGN_OUT } from '@inboxt/graphql';

import { modals } from '~modals/modals';
import { client } from '~utils/client.ts';

import { MenuDrawer } from '../MenuDrawer';

export const UserMenu = () => {
	const navigate = useNavigate();
	const { data } = useQuery(ACTIVE_USER);
	const [signOut] = useMutation(SIGN_OUT, {
		refetchQueries: [ACTIVE_USER],
	});

	const handleSignOut = async () => {
		await signOut();
		await client.cache.reset();

		return navigate({ to: '/' });
	};

	const USER_MENU_ITEMS = [
		{
			label: 'Profile',
			icon: <IconSettings />,
			action: modals.openProfileModal,
		},
		{
			label: 'Emails',
			icon: <IconMail />,
			action: modals.openEmailsModal,
		},
		{
			label: 'Labels',
			icon: <IconTags />,
			action: modals.openLabelsModal,
		},
		{
			label: 'Import',
			icon: <IconCloudUpload />,
			action: modals.openImportModal,
		},
		{
			label: 'API Tokens',
			icon: <IconKey />,
			action: modals.openApiTokensModal,
		},
		{
			label: 'Log Out',
			icon: <IconLogout />,
			action: () => void handleSignOut(),
		},
	];

	return (
		<MenuDrawer items={USER_MENU_ITEMS} label="Quick Actions" height={386}>
			<Avatar
				name={data?.me?.username || 'User'}
				color="initials"
				allowedInitialsColors={['primary']}
				radius={4}
				style={{ cursor: 'pointer' }}
			/>
		</MenuDrawer>
	);
};
