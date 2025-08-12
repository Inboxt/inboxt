import { Button, Group, Stack, Text, Title, Flex } from '@mantine/core';
import dayjs from 'dayjs';
import { useState } from 'react';

import { NewsletterSubscriptionButton } from '~components/NewsletterSubscriptionButton';
import { useScreenQuery } from '~hooks/useScreenQuery';
import { NewsletterSubscription } from '~lib/graphql/generated/graphql';

type SubscriptionsListProps = {
	emailId: string;
	type: 'unsubscribed' | 'active';
	subscriptions: NewsletterSubscription[];
	maxVisible?: number;
};

export const SubscriptionList = ({
	emailId,
	type,
	subscriptions,
	maxVisible = 1,
}: SubscriptionsListProps) => {
	const isBelowXsScreen = useScreenQuery('xs', 'below');
	const [expandedEmailIds, setExpandedEmailIds] = useState<string[]>([]);

	const toggleExpanded = (emailId: string) => {
		setExpandedEmailIds((prev) =>
			prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId],
		);
	};

	if (!subscriptions.length) {
		return null;
	}

	const isExpanded = expandedEmailIds.includes(emailId);
	const title =
		type === 'active'
			? `Subscriptions (${subscriptions.length}):`
			: `Unsubscribed Subscriptions (${subscriptions.length}):`;
	const subsToShow = isExpanded ? subscriptions : subscriptions.slice(0, maxVisible);

	return (
		<Stack gap={4}>
			<Title order={5}>{title}</Title>
			{subsToShow.map((sub) => (
				<Flex
					key={sub.id}
					justify="space-between"
					wrap="nowrap"
					direction={{ base: 'column', xs: 'row' }}
				>
					<Stack
						gap={0}
						style={{
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}
					>
						<Text
							size="sm"
							style={{
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{sub.name}
						</Text>
						{sub.lastReceivedAt && (
							<Text size="xs" c="dimmed">
								Recently received:{' '}
								{dayjs(sub.lastReceivedAt).format('MMM D, YYYY hh:mm A')}
							</Text>
						)}
					</Stack>

					{sub.unsubscribeUrl && (
						<Group mt={isBelowXsScreen ? 'xs' : undefined}>
							<NewsletterSubscriptionButton subscription={sub} />
						</Group>
					)}
				</Flex>
			))}

			{subscriptions.length > maxVisible && (
				<Button variant="subtle" size="xs" onClick={() => toggleExpanded(emailId)}>
					{isExpanded ? 'Show less' : `Show ${subscriptions.length - maxVisible} more`}
				</Button>
			)}
		</Stack>
	);
};
