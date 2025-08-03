import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Newsletter } from './newsletter.model';
import { NewsletterSubscriptionService } from './newsletter-subscription/newsletter-subscription.service';
import { NewsletterSubscription } from './newsletter-subscription/newsletter-subscription.model';
import {
	ActiveUserMeta,
	ActiveUserMetaType,
} from '../../../../decorators/active-user-meta.decorator';

@Resolver(() => Newsletter)
export class NewsletterResolver {
	constructor(private newsletterSubscriptionService: NewsletterSubscriptionService) {}

	@ResolveField('subscription', () => NewsletterSubscription, { nullable: true })
	async subscription(@Parent() newsletter, @ActiveUserMeta() activeUser: ActiveUserMetaType) {
		if (!newsletter?.subscriptionId) {
			return null;
		}

		return this.newsletterSubscriptionService.get(activeUser.id, {
			where: { id: newsletter.subscriptionId },
		});
	}
}
