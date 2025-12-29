import { Module } from '@nestjs/common';

import { NewsletterSubscriptionManagerService } from './newsletter-subscription-manager.service';

@Module({
	providers: [NewsletterSubscriptionManagerService],
	exports: [NewsletterSubscriptionManagerService],
})
export class NewsletterSubscriptionManagerModule {}
