import { Field, InputType } from '@nestjs/graphql';

import { NewsletterSubscriptionStatus } from '~common/enums/newsletter-subscription-status.enum';

@InputType()
export class UpdateNewsletterSubscriptionStatusInput {
	@Field()
	id!: string;

	@Field(() => NewsletterSubscriptionStatus)
	status!: NewsletterSubscriptionStatus;
}
