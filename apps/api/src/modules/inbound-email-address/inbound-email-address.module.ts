import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { InboundEmailAddressService } from './inbound-email-address.service';
import { InboundEmailAddressResolver } from './inbound-email-address.resolver';
import { NewsletterSubscriptionManagerModule } from '../../managers/newsletter-subscription-manager/newsletter-subscription-manager.module';

@Module({
	imports: [NewsletterSubscriptionManagerModule],
	providers: [PrismaService, InboundEmailAddressService, InboundEmailAddressResolver],
	exports: [InboundEmailAddressService],
})
export class InboundEmailAddressModule {}
