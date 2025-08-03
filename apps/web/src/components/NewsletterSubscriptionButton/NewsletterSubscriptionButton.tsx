import { Button, Text } from '@mantine/core';
import { useMutation } from '@apollo/client';

import { modals } from '@modals/modals.ts';

import {
	INBOUND_EMAIL_ADDRESSES,
	SAVED_ITEM,
	UPDATE_NEWSLETTER_SUBSCRIPTION_STATUS,
} from '../../lib/graphql';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type NewsletterSubscriptionButton = {
	subscription: { id: string; status: 'UNSUBSCRIBED' | 'ACTIVE'; unsubscribeUrl?: string };
};

export const NewsletterSubscriptionButton = ({ subscription }: NewsletterSubscriptionButton) => {
	const isBelowXsScreen = useScreenQuery('xs', 'below');

	const [updateNewsletterSubscriptionStatus, { loading }] = useMutation(
		UPDATE_NEWSLETTER_SUBSCRIPTION_STATUS,
		{
			refetchQueries: [INBOUND_EMAIL_ADDRESSES, SAVED_ITEM], // todo: skip one or the other
		},
	);

	const handleButtonAction = async (status: 'UNSUBSCRIBED' | 'ACTIVE') => {
		if (!subscription?.unsubscribeUrl) {
			return;
		}

		if (status === 'UNSUBSCRIBED') {
			window.open(subscription.unsubscribeUrl, '_blank');
		}

		await updateNewsletterSubscriptionStatus({
			variables: {
				data: {
					id: subscription.id,
					status,
				},
			},
		});
	};

	if (!subscription?.unsubscribeUrl) {
		return null;
	}

	if (subscription.status === 'UNSUBSCRIBED') {
		return (
			<Button
				size="compact-md"
				fz="xs"
				variant={isBelowXsScreen ? 'light' : 'white'}
				onClick={() => handleButtonAction('ACTIVE')}
				loading={loading}
				w={isBelowXsScreen ? undefined : 128}
				fullWidth={isBelowXsScreen}
			>
				Keep Subscription
			</Button>
		);
	}

	return (
		<Button
			size="compact-md"
			fz="xs"
			variant={isBelowXsScreen ? 'light' : 'white'}
			color="red"
			w={isBelowXsScreen ? undefined : 128}
			fullWidth={isBelowXsScreen}
			onClick={() =>
				modals.openConfirmModal({
					centered: true,
					title: 'Unsubscribe from this newsletter?',
					size: 640,
					children: (
						<Text size="sm">
							You’ll be redirected to the sender’s website to complete the unsubscribe
							process.
							<br />
							<br />
							We’ll mark this subscription as unsubscribed in your account. If no new
							emails arrive from this sender in the next 90 days, it will be
							automatically removed.
							<br />
							<br />
							You can undo this later if you change your mind.
							<br />
							<br />
							Do you want to continue?
						</Text>
					),
					labels: {
						confirm: 'Unsubscribe',
						cancel: 'Cancel',
					},
					confirmProps: { color: 'red' },
					onConfirm: () => handleButtonAction('UNSUBSCRIBED'),
				})
			}
		>
			Unsubscribe
		</Button>
	);
};
