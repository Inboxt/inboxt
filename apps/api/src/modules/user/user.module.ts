import { Module } from '@nestjs/common';

import { NewsletterSubscriptionManagerModule } from '~managers/newsletter-subscription-manager/newsletter-subscription-manager.module';
import { InboundEmailAddressModule } from '~modules/inbound-email-address/inbound-email-address.module';
import { MailModule } from '~modules/mail/mail.module';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
	imports: [MailModule, InboundEmailAddressModule, NewsletterSubscriptionManagerModule],
	providers: [UserService, UserResolver],
	exports: [UserService],
})
export class UserModule {}
