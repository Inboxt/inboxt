import { Alert, Button, Flex, Text } from '@mantine/core';
import dayjs from 'dayjs';

import { User } from '@inboxt/graphql';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { modals } from '~modals/modals';

type UnverifiedEmailAlertProps = {
	user: User | null;
};

export const UnverifiedEmailAlert = ({ user }: UnverifiedEmailAlertProps) => {
	const isAboveMdScreen = useScreenQuery('md', 'above');
	const isUserVerified = user?.isEmailVerified && !!user.id;

	if (isUserVerified) {
		return null;
	}

	const createdAt = user?.createdAt ? dayjs(user.createdAt) : null;
	const daysSinceCreated = createdAt ? dayjs().diff(createdAt, 'day') : 0;
	const daysLeft = Math.max(0, 45 - daysSinceCreated);

	const baseMessage = isAboveMdScreen
		? "We've sent a confirmation email to your address. Please verify your email to unlock full access to all features."
		: 'Verify your email to unlock full access';

	const countdownMessage = isAboveMdScreen
		? `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to verify your email before your account is automatically deleted.`
		: `Your account is scheduled for deletion soon due to unverified email.`;

	const color = daysLeft <= 3 ? 'red' : daysLeft <= 10 ? 'orange' : 'primary';

	return (
		<Alert radius={0} p="xxs" color={color}>
			<Flex justify="center" gap="sm" wrap="wrap">
				<Text ta="center">{daysLeft <= 10 ? countdownMessage : baseMessage}</Text>
				<Button
					variant="light"
					size="compact-sm"
					onClick={modals.openVerifyEmailModal}
					color={color}
				>
					Verify Now
				</Button>
			</Flex>
		</Alert>
	);
};
