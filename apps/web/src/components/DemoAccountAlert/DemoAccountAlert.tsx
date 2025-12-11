import { Alert, Text } from '@mantine/core';
import dayjs from 'dayjs';

import { User, UserPlan } from '@inboxt/graphql';

import { useScreenQuery } from '~hooks/useScreenQuery';

type UnverifiedEmailAlertProps = {
	user: User | null;
};

export const DemoAccountAlert = ({ user }: UnverifiedEmailAlertProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const isDemoAccount = user?.plan === UserPlan.Demo;

	if (!isDemoAccount || !user?.createdAt) {
		return null;
	}

	const createdAt = dayjs(user.createdAt);
	const hoursSinceCreated = dayjs().diff(createdAt, 'hour');
	const hoursLeft = Math.max(0, 24 - hoursSinceCreated);

	const baseMessage = isAboveMdScreen
		? 'This is a demo account. Your data will be automatically deleted 24 hours after creation. Do not share sensitive information.'
		: 'Demo account – data will be deleted in 24h.';

	const countdownMessage = isAboveMdScreen
		? `You have ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left before your demo account is deleted. Sign up for a permanent account to keep your data.`
		: `Demo expires in ${hoursLeft}h.`;

	return (
		<Alert radius={0} p="xxs" color="red">
			<Text ta="center" w="100%">
				{hoursLeft <= 12 ? countdownMessage : baseMessage}
			</Text>
		</Alert>
	);
};
