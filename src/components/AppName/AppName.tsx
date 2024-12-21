import { IconInbox } from '@tabler/icons-react';
import { Group, Title } from '@mantine/core';

export const AppName = () => {
	return (
		<Group gap="xs">
			<IconInbox />
			<Title order={3} c="blue.6">
				Inbox Reader
			</Title>
		</Group>
	);
};
