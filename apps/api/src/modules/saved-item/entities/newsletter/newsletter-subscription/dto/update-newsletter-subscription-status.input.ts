import { Field, InputType } from '@nestjs/graphql';
import { NewsletterSubscriptionStatus } from '../../../../../../enums/newsletter-subscription-status.enum';

@InputType()
export class UpdateNewsletterSubscriptionStatusInput {
	@Field()
	id!: string;

	@Field(() => NewsletterSubscriptionStatus)
	status!: NewsletterSubscriptionStatus;
}
