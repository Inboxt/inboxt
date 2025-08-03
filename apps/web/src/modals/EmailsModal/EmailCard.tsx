import { Box, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { Subscription, SubscriptionList } from './SubscriptionList.tsx';
import { EmailActions } from './EmailActions.tsx';

export type Email = {
	id: string;
	fullAddress: string;
	createdAt: string;
	subscriptions: Subscription[];
};

type EmailCardProps = {
	email: Email;
};

export const EmailCard = ({ email }: EmailCardProps) => {
	const activeSubscriptions = (email?.subscriptions ?? []).filter(
		(sub) => sub.status === 'ACTIVE',
	);

	const unsubscribedSubscriptions = (email?.subscriptions ?? []).filter(
		(sub) => sub.status === 'UNSUBSCRIBED',
	);

	return (
		<Card withBorder radius="md">
			<Stack>
				<Stack gap={0}>
					<Title order={5}>Email Address:</Title>

					<Group justify="space-between" wrap="nowrap">
						<Stack gap={0} flex={1}>
							<TextInput
								value={email.fullAddress}
								readOnly
								size="sm"
								variant="unstyled"
								style={{
									flexGrow: 1,
								}}
							/>

							<Text size="xs" c="dimmed" mt={-6}>
								Created: {dayjs(email.createdAt).format('MMM D, YYYY')}
							</Text>
						</Stack>

						<Box visibleFrom="xs">
							<EmailActions email={email} />
						</Box>
					</Group>

					<Box hiddenFrom="xs">
						<EmailActions email={email} />
					</Box>
				</Stack>

				<Stack>
					<SubscriptionList
						emailId={email.id}
						type="active"
						subscriptions={activeSubscriptions}
						maxVisible={1}
					/>

					<SubscriptionList
						emailId={email.id}
						type="unsubscribed"
						subscriptions={unsubscribedSubscriptions}
						maxVisible={1}
					/>
				</Stack>
			</Stack>
		</Card>
	);
};
