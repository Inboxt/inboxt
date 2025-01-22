import { IconInbox } from '@tabler/icons-react';
import { Group, Title } from '@mantine/core';

type AppNameProps = {
	size?: 'sm' | 'md';
};

export const AppName = ({ size = 'sm' }: AppNameProps) => {
	return (
		<Group gap="xs">
			<IconInbox size={size === 'md' ? 36 : 24} />
			<Title order={size === 'md' ? 1 : 3} c="blue.6">
				Inbox Reader
			</Title>
		</Group>
	);
};
