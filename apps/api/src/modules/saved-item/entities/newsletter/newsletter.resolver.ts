import { Resolver, ResolveField, Parent } from '@nestjs/graphql';

import { ActiveUserMeta, ActiveUserMetaType } from '~common/decorators/active-user-meta.decorator';
import { ApiTokenAllowed } from '~common/decorators/api-token.decorator';

import { NewsletterSubscription } from './newsletter-subscription/newsletter-subscription.model';
import { NewsletterSubscriptionService } from './newsletter-subscription/newsletter-subscription.service';
import { Newsletter } from './newsletter.model';

@Resolver(() => Newsletter)
export class NewsletterResolver {
	constructor(private readonly newsletterSubscriptionService: NewsletterSubscriptionService) {}

	@ApiTokenAllowed()
	@ResolveField('subscription', () => NewsletterSubscription, { nullable: true })
	async subscription(
		@ActiveUserMeta() activeUser: ActiveUserMetaType,
		@Parent() newsletter: Newsletter & { subscriptionId?: string },
	) {
		if (!newsletter?.subscriptionId) {
			return null;
		}

		return this.newsletterSubscriptionService.get(activeUser.id, {
			where: { id: newsletter.subscriptionId },
		});
	}
}
