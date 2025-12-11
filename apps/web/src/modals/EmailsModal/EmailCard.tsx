import { Box, Card, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import dayjs from 'dayjs';

import { InboundEmailAddress, NewsletterSubscriptionStatus } from '@inboxt/graphql';

import { EmailActions } from './EmailActions';
import { SubscriptionList } from './SubscriptionList';

type EmailCardProps = {
	email: InboundEmailAddress;
};

export const EmailCard = ({ email }: EmailCardProps) => {
	const activeSubscriptions = (email.subscriptions ?? []).filter(
		(sub) => sub.status === NewsletterSubscriptionStatus.Active,
	);

	const unsubscribedSubscriptions = (email.subscriptions ?? []).filter(
		(sub) => sub.status === NewsletterSubscriptionStatus.Unsubscribed,
	);

	return (
		<Card>
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
