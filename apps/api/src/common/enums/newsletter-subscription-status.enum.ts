import { registerEnumType } from '@nestjs/graphql';

export enum NewsletterSubscriptionStatus {
	ACTIVE = 'ACTIVE',
	UNSUBSCRIBED = 'UNSUBSCRIBED',
}

registerEnumType(NewsletterSubscriptionStatus, {
	name: 'newsletterSubscriptionStatus',
	description: "The status of a user's newsletter subscription",
});
