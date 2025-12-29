import { Field, ObjectType } from '@nestjs/graphql';

import { NewsletterSubscriptionStatus } from '~common/enums/newsletter-subscription-status.enum';
import { BaseModel } from '~common/models/base.model';

@ObjectType({ isAbstract: true })
export class NewsletterSubscription extends BaseModel {
	@Field(() => Date, { nullable: true })
	lastReceivedAt?: Date;

	@Field()
	name: string;

	@Field({ nullable: true })
	unsubscribeUrl?: string;

	@Field(() => NewsletterSubscriptionStatus)
	status: NewsletterSubscriptionStatus;

	@Field(() => Date, { nullable: true })
	unsubscribeAttemptedAt?: Date;
}
