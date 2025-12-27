import { Alert, Button, Flex, Text } from '@mantine/core';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { User } from '~lib/graphql';
import { modals } from '~modals/modals.ts';
import { getUserStorage } from '~utils/userStorage';

type Props = {
	user: User | null;
};

export const StorageQuotaAlert = ({ user }: Props) => {
	const isAboveMd = useScreenQuery('md', 'above');
	if (!user) {
		return null;
	}

	const { storagePercentage } = getUserStorage(user);
	const is80 = storagePercentage >= 80 && storagePercentage < 100;
	const is100 = storagePercentage >= 100;

	if (!is80 && !is100) {
		return null;
	}

	const color = is100 ? 'red' : 'orange';

	const baseTextLarge = is100
		? 'Storage limit reached. Adding new items is paused until you free space.'
		: 'You’re nearing your storage limit. Free up space to avoid interruptions.';

	const baseTextCompact = is100
		? 'Storage limit reached. Some actions may be paused.'
		: 'Nearing storage limit. Free up space.';

	return (
		<Alert radius={0} p="xxs" color={color}>
			<Flex justify="center" gap="sm" wrap="wrap" align="center">
				<Text ta="center">{isAboveMd ? baseTextLarge : baseTextCompact}</Text>

				<Button
					variant="light"
					size="compact-sm"
					color={color}
					onClick={modals.openStorageHelpModal}
				>
					Learn How
				</Button>
			</Flex>
		</Alert>
	);
};
