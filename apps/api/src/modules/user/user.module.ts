import { Module } from '@nestjs/common';

import { UserService } from './user.service';
import { PrismaService } from '../../services/prisma.service';
import { UserResolver } from './user.resolver';
import { MailModule } from '../mail/mail.module';
import { InboundEmailAddressModule } from '../inbound-email-address/inbound-email-address.module';
import { NewsletterSubscriptionManagerModule } from '../../managers/newsletter-subscription-manager/newsletter-subscription-manager.module';

@Module({
	imports: [MailModule, InboundEmailAddressModule, NewsletterSubscriptionManagerModule],
	providers: [UserService, PrismaService, UserResolver],
	exports: [UserService],
})
export class UserModule {}
