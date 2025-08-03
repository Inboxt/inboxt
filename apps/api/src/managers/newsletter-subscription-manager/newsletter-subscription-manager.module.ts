import { Module } from '@nestjs/common';

import { PrismaService } from '../../services/prisma.service';
import { NewsletterSubscriptionManagerService } from './newsletter-subscription-manager.service';

@Module({
	providers: [PrismaService, NewsletterSubscriptionManagerService],
	exports: [NewsletterSubscriptionManagerService],
})
export class NewsletterSubscriptionManagerModule {}
