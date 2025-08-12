import { Group, Title, TitleOrder } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

type AppNameProps = {
	size?: 'sm' | 'md' | 'lg';
	variant?: 'full' | 'short';
};

export const AppName = ({ size = 'sm', variant = 'full' }: AppNameProps) => {
	let iconSize;
	let titleSize: TitleOrder;

	switch (size) {
		case 'sm':
			iconSize = 24;
			titleSize = 3;
			break;

		case 'md':
			iconSize = 30;
			titleSize = 3;
			break;

		case 'lg':
			iconSize = 36;
			titleSize = 1;
			break;
	}

	return (
		<Group gap="xs">
			<IconInbox size={iconSize} />
			{variant === 'full' && (
				<Title order={titleSize} c="blue.6">
					Inbox Reader
				</Title>
			)}
		</Group>
	);
};
