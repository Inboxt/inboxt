import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { NewsletterSubscription } from './newsletter-subscription.model';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';

import { Void } from '../../../../../models/void.model';
import { VOID_RESPONSE } from '../../../../../constants/void';
import { UpdateNewsletterSubscriptionStatusInput } from './dto/update-newsletter-subscription-status.input';
import {
	ActiveUserMeta,
	ActiveUserMetaType,
} from '../../../../../decorators/active-user-meta.decorator';
import { VerifiedOnly } from '../../../../../decorators/account.decorator';

@Resolver(() => NewsletterSubscription)
export class NewsletterSubscriptionResolver {
	constructor(private newsletterSubscriptionService: NewsletterSubscriptionService) {}

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
