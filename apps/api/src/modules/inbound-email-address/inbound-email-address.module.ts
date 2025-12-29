import { Module } from '@nestjs/common';

import { NewsletterSubscriptionManagerModule } from '~managers/newsletter-subscription-manager/newsletter-subscription-manager.module';

import { InboundEmailAddressResolver } from './inbound-email-address.resolver';
import { InboundEmailAddressService } from './inbound-email-address.service';

@Module({
	imports: [NewsletterSubscriptionManagerModule],
	providers: [InboundEmailAddressService, InboundEmailAddressResolver],
	exports: [InboundEmailAddressService],
})
export class InboundEmailAddressModule {}
