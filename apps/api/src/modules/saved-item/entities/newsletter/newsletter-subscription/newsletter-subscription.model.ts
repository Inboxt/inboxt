import { Field, ObjectType } from '@nestjs/graphql';

import { BaseModel } from '../../../../../models/base.model';
import { NewsletterSubscriptionStatus } from '../../../../../enums/newsletter-subscription-status.enum';

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
