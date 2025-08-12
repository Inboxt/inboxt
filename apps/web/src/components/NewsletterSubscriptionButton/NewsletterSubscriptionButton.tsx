import { useMutation } from '@apollo/client';
import { Button, Text } from '@mantine/core';

import { useScreenQuery } from '~hooks/useScreenQuery';
import {
	INBOUND_EMAIL_ADDRESSES,
	SAVED_ITEM,
	UPDATE_NEWSLETTER_SUBSCRIPTION_STATUS,
} from '~lib/graphql';
import {
	NewsletterSubscription,
	NewsletterSubscriptionStatus,
} from '~lib/graphql/generated/graphql';
import { modals } from '~modals/modals';

type NewsletterSubscriptionButton = {
	subscription: NewsletterSubscription;
};

export const NewsletterSubscriptionButton = ({ subscription }: NewsletterSubscriptionButton) => {
	const isBelowXsScreen = useScreenQuery('xs', 'below');

	const [updateNewsletterSubscriptionStatus, { loading }] = useMutation(
		UPDATE_NEWSLETTER_SUBSCRIPTION_STATUS,
		{
			refetchQueries: [INBOUND_EMAIL_ADDRESSES, SAVED_ITEM], // todo: skip one or the other
		},
	);

	const handleButtonAction = async (status: NewsletterSubscription['status']) => {
		if (!subscription.unsubscribeUrl) {
			return;
		}

		if (status === NewsletterSubscriptionStatus.Unsubscribed) {
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

	if (!subscription.unsubscribeUrl) {
		return null;
	}

	if (subscription.status === NewsletterSubscriptionStatus.Unsubscribed) {
		return (
			<Button
				size="compact-md"
				fz="xs"
				variant={isBelowXsScreen ? 'light' : 'white'}
				onClick={() => void handleButtonAction(NewsletterSubscriptionStatus.Active)}
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
					onConfirm: () => handleButtonAction(NewsletterSubscriptionStatus.Unsubscribed),
				})
			}
		>
			Unsubscribe
		</Button>
	);
};
