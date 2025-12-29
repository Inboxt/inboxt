import { Resolver, Mutation, Args } from '@nestjs/graphql';

import { VOID_RESPONSE } from '~common/constants/void';
import { VerifiedOnly } from '~common/decorators/account.decorator';
import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { Void } from '~common/models/void.model';

import { UpdateNewsletterSubscriptionStatusInput } from './dto/update-newsletter-subscription-status.input';
import { NewsletterSubscription } from './newsletter-subscription.model';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';

@Resolver(() => NewsletterSubscription)
export class NewsletterSubscriptionResolver {
	constructor(private readonly newsletterSubscriptionService: NewsletterSubscriptionService) {}

	@VerifiedOnly()
	@Mutation(() => Void)
	async updateNewsletterSubscriptionStatus(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Args('data') data: UpdateNewsletterSubscriptionStatusInput,
	) {
		await this.newsletterSubscriptionService.updateStatus(activeUser.id, data.id, data.status);
		return VOID_RESPONSE;
	}
}
