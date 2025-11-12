import { Module } from '@nestjs/common';
import { PrismaService } from '../../../../services/prisma.service';
import { NewsletterService } from './newsletter.service';
import { NewsletterResolver } from './newsletter.resolver';
import { InboundEmailAddressModule } from '../../../inbound-email-address/inbound-email-address.module';
import { NewsletterSubscriptionService } from './newsletter-subscription/newsletter-subscription.service';
import { NewsletterSubscriptionResolver } from './newsletter-subscription/newsletter-subscription.resolver';
import { ContentExtractionService } from '../../../../services/content-extraction.service';
import { StorageModule } from '../../../storage/storage.module';

@Module({
	imports: [InboundEmailAddressModule, StorageModule],
	providers: [
		PrismaService,
		NewsletterService,
		NewsletterSubscriptionService,
		NewsletterResolver,
		NewsletterSubscriptionResolver,
		ContentExtractionService,
	],
	exports: [NewsletterService, NewsletterSubscriptionService],
})
export class NewsletterModule {}
