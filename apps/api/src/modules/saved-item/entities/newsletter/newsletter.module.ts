import { Module } from '@nestjs/common';

import { InboundEmailAddressModule } from '~modules/inbound-email-address/inbound-email-address.module';
import { StorageModule } from '~modules/storage/storage.module';
import { ContentExtractionService } from '~services/content-extraction.service';

import { NewsletterSubscriptionResolver } from './newsletter-subscription/newsletter-subscription.resolver';
import { NewsletterSubscriptionService } from './newsletter-subscription/newsletter-subscription.service';
import { NewsletterResolver } from './newsletter.resolver';
import { NewsletterService } from './newsletter.service';

@Module({
	imports: [InboundEmailAddressModule, StorageModule],
	providers: [
		NewsletterService,
		NewsletterSubscriptionService,
		NewsletterResolver,
		NewsletterSubscriptionResolver,
		ContentExtractionService,
	],
	exports: [NewsletterService, NewsletterSubscriptionService],
})
export class NewsletterModule {}
